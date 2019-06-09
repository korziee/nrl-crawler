"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
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
            matchId: matchId,
            // matchId: `${match.roundNumber}/${match.homeTeam.nickName}-v-${
            //   match.awayTeam.nickName
            // }`,
            gameSecondsElapsed: match.gameSeconds
        };
    }
    async getRoundDetails(round) {
        const { data } = await axios_1.default
            .get(`https://www.nrl.com/draw/data/?competition=111&season=2019&round=${round}`)
            .catch(e => {
            throw new Error(e);
        });
        const { drawGroups } = data;
        // console.log(1, drawGroups);
        const matchCentreUrl = drawGroups[0].matches[0].matchCentreUrl;
        const roundFromMatchCentreUrl = matchCentreUrl
            .match(/(round-..?)\//)[1]
            .split("-")[1];
        const byes = [];
        const matches = drawGroups.reduce((accum, group) => {
            if (group.title === "Byes") {
                byes.push(...group.byes.map((x) => x.teamNickName));
                return accum;
            }
            if (accum[group.title]) {
                return accum;
            }
            accum[group.title] = group.matches.map((x) => {
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
            });
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
// new NrlApi()
//   .getRoundDetails()
//   .then(x => console.log(JSON.stringify(x, null, 2)));
//# sourceMappingURL=index.js.map