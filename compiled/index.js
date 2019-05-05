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
exports.getMatchesByRound = async (round) => {
    const { data } = await axios_1.default.get(`https://www.nrl.com/draw/?competition=111&season=2019&round=${round ? round : "" // defaults to the current round!
    }`);
    const { document } = new jsdom_1.JSDOM(data).window;
    const drawData = JSON.parse(document.querySelector("#vue-draw").getAttribute("q-data"));
    const matches = drawData.drawGroups
        .flatMap((day) => day.matches)
        .map((match) => ({
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
    }));
    return matches;
};
// getMatchesByRound().then(console.log);
// getMatchEventSource(
//   "https://www.nrl.com/live-events?topic=/match/20191110830/detail"
// ).then(src => {
//   src.onmessage = msg => console.log(msg);
// });
//# sourceMappingURL=index.js.map