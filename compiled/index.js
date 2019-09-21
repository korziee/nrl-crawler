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
            .get(`https://www.nrl.com/draw/nrl-premiership/2019/${round}/${slug}/data`)
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
        const { fixtures, byes } = data;
        const matchCentreUrl = fixtures[0].matchCentreUrl;
        const isFinals = matchCentreUrl.includes("finals-week");
        const matchId = isFinals
            ? matchCentreUrl.match(/(finals-week-.)\/(game-.)/)[0]
            : matchCentreUrl.match(/(round-..?)\/(.+-v-.+)\//)[0];
        const mappedByes = byes
            ? byes.map((b) => b.teamNickName)
            : [];
        const matches = fixtures.map((f) => {
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
//# sourceMappingURL=index.js.map