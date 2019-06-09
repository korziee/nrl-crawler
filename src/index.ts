import axios from "axios";
import { rounds } from "./rounds";

/**
 * Seems that quite a lot of data pages on the NRL site respond when you append a "/data" to the end of the url.
 * @example https://www.nrl.com/draw/data?competition=111&season=2019&round=17
 */

interface ITeam {
  name?: string;
  nickName: string;
}

interface INrlLadder {
  [key: string]: string;
}

interface INrlRoundKey {
  // roundnumber: roundname
  [key: string]: string;
}

interface INrlApi {
  /** Returns the current ladder in a keyed format */
  getLadder: () => Promise<INrlLadder>;
  getMatchDetails: (matchId: string, round: number) => Promise<INrlMatch>;
  /** Information on a specific round */
  getRoundDetails: (round?: number) => Promise<INrlRound>;
  /** List of all rounds, includes finals. */
  getAllRounds: () => Promise<INrlRoundKey>;
}

export interface INrlRound {
  /** Matches are grouped up in the days in which they occur */
  matches: { [key: string]: INrlMatch[] };
  /** Names of teams with byes */
  byes: string[];
}

export interface INrlMatch {
  matchMode: "Post" | "Pre" | "Current";
  venue: string;
  round: string;
  matchId: string;
  homeTeam: ITeam;
  awayTeam: ITeam;
  kickOffTime: Date;
}

export interface INrlMatchLive extends INrlMatch {
  homeScore: string;
  awayScore: string;
  /** @example "23:40" */
  gameSecondsElapsed: string;
}

export class NrlApi implements INrlApi {
  async getMatchDetails(matchId: string): Promise<INrlMatchLive> {
    if (!matchId) {
      throw new Error("MatchId is required");
    }

    const [round, slug] = matchId.split("/");
    const { data: match } = await axios
      .get(
        `https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${slug}/data`
      )
      .catch(e => {
        throw new Error(e);
      });

    return {
      homeTeam: {
        nickName: match.homeTeam.nickName,
        name: match.homeTeam.name
      },
      awayTeam: {
        nickName: match.awayTeam.nickName,
        name: match.awayTeam.name
      },
      homeScore: match.homeTeam.score || 0,
      awayScore: match.awayTeam.score || 0,
      matchMode: match.matchMode,
      venue: match.venue,
      round: match.roundNumber,
      // TODO - fix matchTime to be timezone specific
      kickOffTime: match.startTime,
      matchId: matchId,
      // matchId: `${match.roundNumber}/${match.homeTeam.nickName}-v-${
      //   match.awayTeam.nickName
      // }`,
      gameSecondsElapsed: match.gameSeconds
    };
  }

  async getRoundDetails(round?: number): Promise<INrlRound> {
    const { data } = await axios
      .get(
        `https://www.nrl.com/draw/data/?competition=111&season=2019&round=${round}`
      )
      .catch(e => {
        throw new Error(e);
      });

    const { drawGroups } = data;

    // console.log(1, drawGroups);

    const matchCentreUrl = drawGroups[0].matches[0].matchCentreUrl;
    const roundFromMatchCentreUrl = matchCentreUrl
      .match(/(round-..?)\//)[1]
      .split("-")[1];

    const byes: string[] = [];

    const matches = drawGroups.reduce(
      (accum: { [key: string]: INrlMatch }, group: any) => {
        if (group.title === "Byes") {
          byes.push(...group.byes.map((x: any) => x.teamNickName));
          return accum;
        }
        if (accum[group.title]) {
          return accum;
        }
        accum[group.title] = group.matches.map(
          (x: any): INrlMatch => {
            const trimmedHomeName = x.homeTeam.nickName
              .replace(/\s/, "-")
              .toLowerCase();
            const trimmedAwayName = x.awayTeam.nickName
              .replace(/\s/, "-")
              .toLowerCase();
            return {
              awayTeam: {
                nickName: x.awayTeam.nickName
              },
              homeTeam: {
                nickName: x.homeTeam.nickName
              },
              kickOffTime: x.clock.kickOffTimeLong,
              matchId: `${roundFromMatchCentreUrl}/${trimmedHomeName}-v-${trimmedAwayName}`,
              matchMode: x.matchMode,
              round: roundFromMatchCentreUrl,
              venue: x.venue
            };
          }
        );
        return accum;
      },
      {} as {
        [key: string]: INrlMatch[];
      }
    );
    return {
      matches,
      byes
    };
  }

  async getLadder(): Promise<INrlLadder> {
    const { data } = await axios
      .get("https://www.nrl.com/ladder/data")
      .catch(e => {
        throw new Error(e);
      });

    const { ladder } = data;

    return ladder.reduce((ladder: INrlLadder, team: any, index: number) => {
      ladder[index + 1] = team.teamNickName;
      return ladder;
    }, {});
  }

  async getAllRounds() {
    return Promise.resolve(rounds);
  }
}

new NrlApi()
  .getRoundDetails()
  .then(x => console.log(JSON.stringify(x, null, 2)));
