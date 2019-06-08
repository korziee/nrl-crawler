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
    matches: {
        [key: string]: INrlMatch[];
    };
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
export declare class NrlApi implements INrlApi {
    static getMatchDetails(matchId: string): Promise<INrlMatchLive>;
    static getRoundDetails(round?: number): Promise<INrlRound>;
}
export {};
