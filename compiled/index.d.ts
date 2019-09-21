/**
 * Seems that quite a lot of data pages on the NRL site respond when you append a "/data" to the end of the url.
 * @example https://www.nrl.com/draw/data?competition=111&season=2019&round=17
 */
interface ITeam {
    name?: string;
    nickName: string;
}
interface INrlLadder {
    [key: string]: string;
}
interface INrlRoundKey {
    [key: string]: string;
}
interface INrlApi {
    /** Returns the current ladder in a keyed format */
    getLadder: () => Promise<INrlLadder>;
    getMatchDetails: (matchId: string, round: number) => Promise<INrlMatch>;
    /** Information on a specific round */
    getRoundDetails: (round?: number) => Promise<INrlRound>;
    /** List of all rounds, includes finals. */
    getAllRounds: () => Promise<INrlRoundKey>;
}
export interface INrlRound {
    matches: INrlMatch[];
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
    getMatchDetails(matchId: string): Promise<INrlMatchLive>;
    getRoundDetails(round?: number): Promise<INrlRound>;
    getLadder(): Promise<INrlLadder>;
    getAllRounds(): Promise<{
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
        11: string;
        12: string;
        13: string;
        14: string;
        15: string;
        16: string;
        17: string;
        18: string;
        19: string;
        20: string;
        21: string;
        22: string;
        23: string;
        24: string;
        25: string;
        26: string;
        27: string;
        28: string;
        29: string;
    }>;
}
export {};
