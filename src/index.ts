import axios from "axios";
import { JSDOM } from "jsdom";
// import * as EventSource from "eventsource";

// FOUND AN API!!! https://www.nrl.com/draw/data?competition=111&season=2019&round=17
// ANYTHING WITH THE /data on the end returns JSON!!!!

interface ITeam {
  name?: string;
  nickName: string;
}

interface INrlLadder {
  [key: string]: string;
}
interface INrlApi {
  /** Returns the current ladder in a keyed format */
  getLadder: () => Promise<INrlLadder>;
  getMatchDetails: (matchId: string, round: number) => Promise<INrlMatch>;
  /** Information on a specific round */
  getRoundDetails: (round?: number) => Promise<INrlRound>;
  /** Information from all of the rounds */
  getAllRounds: () => Promise<any>;
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
  static async getMatchDetails(matchId: string): Promise<INrlMatchLive> {
    if (!matchId) {
      throw new Error("MatchId is required");
    }

    const [round, slug] = matchId.split("/");
    let data;
    try {
      const response = await axios.get(
        // TODO - remove hard-coded 2019
        `https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${slug}/`
      );
      data = response.data;
    } catch (e) {
      throw new Error(e);
    }
    const { document } = new JSDOM(data).window;

    const { match } = JSON.parse(
      document.querySelector("#vue-match-centre").getAttribute("q-data")
    );

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
      matchId: `${match.roundNumber}/${match.homeTeam.nickName}-v-${
        match.awayTeam.nickName
      }`,
      gameSecondsElapsed: match.gameSeconds
    };
  }

  static async getRoundDetails(round?: number): Promise<INrlRound> {
    let data;
    try {
      const response = await axios.get(
        // TODO - remove hard-coded 2019
        `https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/`
      );
      data = response.data;
    } catch (e) {
      throw new Error(e);
    }
    const { document } = new JSDOM(data).window;
    const gameData = JSON.parse(
      document.querySelector("#vue-draw").getAttribute("q-data")
    );
    const { drawGroups } = gameData;

    const drawRound =
      (round && round.toString()) ||
      document.querySelector(".filter-round__button--dropdown").textContent;

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
          (x: any): INrlMatch => ({
            awayTeam: {
              nickName: x.awayTeam.nickName
            },
            homeTeam: {
              nickName: x.homeTeam.nickName
            },
            kickOffTime: x.clock.kickOffTimeLong,
            matchId: `${drawRound}/${x.homeTeam.nickName}-v-${
              x.awayTeam.nickName
            }`,
            matchMode: x.matchMode,
            round: drawRound,
            venue: x.venue
          })
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
}

NrlApi.getRoundDetails(16).then(console.log);

// interface ITeam {
//   name: string;
//   score: number;
//   ladderPosition: string;
// }

// export interface INrlMatch {
//   matchMode: "Post" | "Pre" | "Current";
//   round: string;
//   venue: string;
//   homeTeam: ITeam;
//   awayTeam: ITeam;
//   clock: {
//     kickOffTime: Date;
//     currentGameTime: string;
//   };
// }

// /**
//  * Returns an event source..
//  *
//  * @todo have not tested
//  *
//  * @param matchSlug the slug from the nrl site
//  */
// export const getMatchEventSource = async (matchSlug: string) => {
//   // return new EventSource(matchSlug);
// };

// export const getLiveMatchScore = async (
//   round: string,
//   /** away-vs-home */
//   matchSlug: string
// ): Promise<INrlMatch> => {
//   let data;
//   try {
//     const response = await axios.get(
//       `https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${matchSlug}/`
//     );
//     data = response.data;
//   } catch (e) {
//     console.error(e);
//     return;
//   }

//   const { document } = new JSDOM(data).window;

//   const gameData = JSON.parse(
//     document.querySelector("#vue-match-centre").getAttribute("q-data")
//   );

//   const clockTimeElement = document.querySelector(".match-clock__time");

//   let clockTime;
//   if (clockTimeElement) {
//     clockTime = clockTimeElement.innerHTML.trim();
//   }

//   return {
//     venue: gameData.venue,
//     round: round,
//     clock: {
//       currentGameTime: clockTime || "unknown",
//       kickOffTime: gameData.startTime
//     },
//     matchMode: ""
//   };
// };

// export const getMatchesByRound = async (
//   round?: number
// ): Promise<INrlMatch[]> => {
//   let data;
//   try {
//     const response = await axios.get(
//       `https://www.nrl.com/draw/?competition=111&season=2019&round=${
//         round ? round : "" // defaults to the current round!
//       }`
//     );
//     data = response.data;
//   } catch (e) {
//     throw e;
//   }

//   const { document } = new JSDOM(data).window;

//   const drawData = JSON.parse(
//     document.querySelector("#vue-draw").getAttribute("q-data")
//   );

//   const pageRound = document
//     .querySelector(".filter-round__button--dropdown")
//     .innerHTML.trim();

//   console.log(1, drawData.drawGroups[1].matches);

//   const matches: INrlMatch[] = (drawData.drawGroups as [])
//     .filter((v: any) => v.title !== "Byes")
//     .flatMap((day: any) => day.matches)
//     .map(
//       (match): INrlMatch => ({
//         venue: match.venue,
//         matchMode: match.matchMode,
//         round: pageRound,
//         homeTeam: {
//           name: match.homeTeam.nickName,
//           ladderPosition: match.homeTeam.teamPosition,
//           score: match.homeTeam.score
//         },
//         awayTeam: {
//           name: match.awayTeam.nickName,
//           ladderPosition: match.awayTeam.teamPosition,
//           score: match.awayTeam.score
//         },
//         clock: {
//           currentGameTime: match.clock.gameTime,
//           kickOffTime: match.clock.kickOffTimeLong
//         }
//       })
//     );
//   return matches;
// };

// getMatchesByRound().then(console.log);

// getMatchEventSource(
//   "https://www.nrl.com/live-events?topic=/match/20191110830/detail"
// ).then(src => {
//   src.onmessage = msg => console.log(msg);
// });
