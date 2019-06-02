import axios from "axios";
import { JSDOM } from "jsdom";
// import * as EventSource from "eventsource";

interface ITeam {
  name: string;
  score: number;
  ladderPosition: string;
}

export interface INrlMatch {
  matchMode: "Post" | "Pre" | "Current";
  round: string;
  venue: string;
  homeTeam: ITeam;
  awayTeam: ITeam;
  clock: {
    kickOffTime: Date;
    /** @example "23:40" */
    currentGameTime: string;
  };
}

export interface ILiveNrlMatch {
  homeScore: string;
  awayScore: string;
  clock:
}

/**
 * Returns an event source..
 *
 * @todo have not tested
 *
 * @param matchSlug the slug from the nrl site
 */
export const getMatchEventSource = async (matchSlug: string) => {
  // return new EventSource(matchSlug);
};

export const getLiveMatchScore = async (
  round: string,
  /** away-vs-home */
  matchSlug: string
): Promise<INrlMatch> => {
  let data;
  try {
    const response = await axios.get(
      `https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${matchSlug}/`
    );
    data = response.data;
  } catch (e) {
    console.error(e);
    return;
  }

  const { document } = new JSDOM(data).window;

  const gameData = JSON.parse(
    document.querySelector("#vue-match-centre").getAttribute("q-data")
  );

  const clockTimeElement = document.querySelector(".match-clock__time");

  let clockTime;
  if (clockTimeElement) {
    clockTime = clockTimeElement.innerHTML.trim();
  }

  return {
    venue: gameData.venue,
    round: round,
    clock: {
      currentGameTime: clockTime || "unknown",
      kickOffTime: gameData.startTime
    },
    matchMode: ""
  };
};

export const getMatchesByRound = async (
  round?: number
): Promise<INrlMatch[]> => {
  let data;
  try {
    const response = await axios.get(
      `https://www.nrl.com/draw/?competition=111&season=2019&round=${
        round ? round : "" // defaults to the current round!
      }`
    );
    data = response.data;
  } catch (e) {
    throw e;
  }

  const { document } = new JSDOM(data).window;

  const drawData = JSON.parse(
    document.querySelector("#vue-draw").getAttribute("q-data")
  );

  const pageRound = document
    .querySelector(".filter-round__button--dropdown")
    .innerHTML.trim();

  console.log(1, drawData.drawGroups[1].matches);

  const matches: INrlMatch[] = (drawData.drawGroups as [])
    .filter((v: any) => v.title !== "Byes")
    .flatMap((day: any) => day.matches)
    .map(
      (match): INrlMatch => ({
        venue: match.venue,
        matchMode: match.matchMode,
        round: pageRound,
        homeTeam: {
          name: match.homeTeam.nickName,
          ladderPosition: match.homeTeam.teamPosition,
          score: match.homeTeam.score
        },
        awayTeam: {
          name: match.awayTeam.nickName,
          ladderPosition: match.awayTeam.teamPosition,
          score: match.awayTeam.score
        },
        clock: {
          currentGameTime: match.clock.gameTime,
          kickOffTime: match.clock.kickOffTimeLong
        }
      })
    );
  return matches;
};

getMatchesByRound().then(console.log);

// getMatchEventSource(
//   "https://www.nrl.com/live-events?topic=/match/20191110830/detail"
// ).then(src => {
//   src.onmessage = msg => console.log(msg);
// });
