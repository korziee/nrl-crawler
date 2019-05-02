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
export declare const getMatchesByRound: (round?: number) => Promise<INrlMatch[]>;
export {};
