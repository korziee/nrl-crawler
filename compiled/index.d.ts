interface ITeam {
    name: string;
    nickName: string;
}
interface INrlApi {
    getMatchDetails: (matchId: string, round: number) => Promise<INrlMatch>;
    getRoundDetails: (round?: number) => Promise<INrlRound>;
    getAllRounds: () => Promise<any>;
}
/** Matches are grouped up in the days in which they occur */
export interface INrlRound {
    date: Date;
    matches: INrlMatch[];
}
export interface INrlMatch {
    matchMode: "Post" | "Pre" | "Current";
    venue: string;
    round: string;
    matchId: string;
    homeTeam: ITeam;
    awayTeam: ITeam;
    homeScore: string;
    awayScore: string;
    kickOffTime: Date;
    /** @example "23:40" */
    gameSecondsElapsed: string;
}
export declare class NrlApi implements INrlApi {
    static getMatchDetails(matchId: string): Promise<INrlMatch>;
}
export {};
