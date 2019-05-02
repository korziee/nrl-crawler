import axios from "axios";
import { JSDOM } from "jsdom";

interface ITeam {
  name: "string";
  score: number;
  ladderPosition: string;
}

export interface INrlMatch {
  matchMode: "Post" | "Pre" | "Current";
  venue: string;
  homeTeam: ITeam;
  awayTeam: ITeam;
  clock: {
    kickOffTime: Date;
    /** @example "23:40" */
    currentGameTime: string;
  };
}

export const getMatchesByRound = async (
  round?: number
): Promise<INrlMatch[]> => {
  const { data } = await axios.get(
    `https://www.nrl.com/draw/?competition=111&season=2019&round=${
      round ? round : "" // defaults to the current round!
    }`
  );

  const { document } = new JSDOM(data).window;

  const drawData = JSON.parse(
    document.querySelector("#vue-draw").getAttribute("q-data")
  );

  const matches: INrlMatch[] = (drawData.drawGroups as [])
    .flatMap((day: any) => day.matches)
    .map(
      (match): INrlMatch => ({
        venue: match.venue,
        matchMode: match.matchMode,
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
