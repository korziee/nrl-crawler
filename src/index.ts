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
  matches: INrlMatch[];
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
        `https://www.nrl.com/draw/nrl-premiership/2019/${round}/${slug}/data`
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

    const { fixtures, byes } = data;

    const matchCentreUrl = fixtures[0].matchCentreUrl;
    const isFinals = matchCentreUrl.includes("finals-week");
    const matchId = isFinals
      ? matchCentreUrl.match(/(finals-week-.)\/(game-.)/)[0]
      : matchCentreUrl.match(/(round-..?)\/(.+-v-.+)\//)[0];

    const mappedByes: string[] = byes
      ? byes.map((b: any) => b.teamNickName)
      : [];

    const matches = fixtures.map((f: any) => {
      return {
        awayTeam: {
          nickName: f.awayTeam.nickName
        },
        homeTeam: {
          nickName: f.homeTeam.nickName
        },
        kickOffTime: f.clock.kickOffTimeLong,
        matchId: matchId,
        matchMode: f.matchMode,
        round: matchId.split("/")[0],
        venue: f.venue
      };
    });

    return {
      matches,
      byes: mappedByes
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
