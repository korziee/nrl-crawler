"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const jsdom_1 = require("jsdom");
const rounds_1 = require("./rounds");
class NrlApi {
    async getMatchDetails(matchId) {
        if (!matchId) {
            throw new Error("MatchId is required");
        }
        const [round, slug] = matchId.split("/");
        const { data: match } = await axios_1.default
            .get(`https://www.nrl.com/draw/nrl-premiership/2019/round-${round}/${slug}/data`)
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
            matchId: `${match.roundNumber}/${match.homeTeam.nickName}-v-${match.awayTeam.nickName}`,
            gameSecondsElapsed: match.gameSeconds
        };
    }
    async getRoundDetails(round) {
        let data;
        try {
            const response = await axios_1.default.get(
            // TODO - remove hard-coded 2019
            `https://www.nrl.com/draw/nrl-premiership/2019/${round ? `round-${round}/` : ""}`);
            data = response.data;
        }
        catch (e) {
            throw new Error(e);
        }
        const { document } = new jsdom_1.JSDOM(data).window;
        const gameData = JSON.parse(document.querySelector("#vue-draw").getAttribute("q-data"));
        const { drawGroups } = gameData;
        const drawRound = (round && round.toString()) ||
            document.querySelector(".filter-round__button--dropdown").textContent;
        const byes = [];
        const matches = drawGroups.reduce((accum, group) => {
            if (group.title === "Byes") {
                byes.push(...group.byes.map((x) => x.teamNickName));
                return accum;
            }
            if (accum[group.title]) {
                return accum;
            }
            accum[group.title] = group.matches.map((x) => ({
                awayTeam: {
                    nickName: x.awayTeam.nickName
                },
                homeTeam: {
                    nickName: x.homeTeam.nickName
                },
                kickOffTime: x.clock.kickOffTimeLong,
                matchId: `${drawRound}/${x.homeTeam.nickName}-v-${x.awayTeam.nickName}`,
                matchMode: x.matchMode,
                round: drawRound,
                venue: x.venue
            }));
            return accum;
        }, {});
        return {
            matches,
            byes
        };
    }
    async getLadder() {
        const { data } = await axios_1.default
            .get("https://www.nrl.com/ladder/data")
            .catch(e => {
            throw new Error(e);
        });
        const { ladder } = data;
        return ladder.reduce((ladder, team, index) => {
            ladder[index + 1] = team.teamNickName;
            return ladder;
        }, {});
    }
    async getAllRounds() {
        return Promise.resolve(rounds_1.rounds);
    }
}
exports.NrlApi = NrlApi;
// new NrlApi().getMatchDetails("13/rabbitohs-v-knights").then(console.log);
//# sourceMappingURL=index.js.map