"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const jsdom_1 = require("jsdom");
/**
 * Returns an event source..
 *
 * @todo have not tested
 *
 * @param matchSlug the slug from the nrl site
 */
exports.getMatchEventSource = async (matchSlug) => {
    // return new EventSource(matchSlug);
};
exports.getLiveMatchScore = async (round, 
/** away-vs-home */
matchSlug) => {
    let data;
    try {
        const response = await axios_1.default.get(`https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${matchSlug}/`);
        data = response.data;
    }
    catch (e) {
        console.error(e);
        return;
    }
    const { document } = new jsdom_1.JSDOM(data).window;
    const gameData = JSON.parse(document.querySelector("#vue-match-centre").getAttribute("q-data"));
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
exports.getMatchesByRound = async (round) => {
    let data;
    try {
        const response = await axios_1.default.get(`https://www.nrl.com/draw/?competition=111&season=2019&round=${round ? round : "" // defaults to the current round!
        }`);
        data = response.data;
    }
    catch (e) {
        throw e;
    }
    const { document } = new jsdom_1.JSDOM(data).window;
    const drawData = JSON.parse(document.querySelector("#vue-draw").getAttribute("q-data"));
    const pageRound = document
        .querySelector(".filter-round__button--dropdown")
        .innerHTML.trim();
    console.log(1, drawData.drawGroups[1].matches);
    const matches = drawData.drawGroups
        .filter((v) => v.title !== "Byes")
        .flatMap((day) => day.matches)
        .map((match) => ({
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
    }));
    return matches;
};
exports.getMatchesByRound().then(console.log);
// getMatchEventSource(
//   "https://www.nrl.com/live-events?topic=/match/20191110830/detail"
// ).then(src => {
//   src.onmessage = msg => console.log(msg);
// });
//# sourceMappingURL=index.js.map