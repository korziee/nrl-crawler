import * as EventSource from "eventsource";
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
/**
 * Returns an event source..
 *
 * @todo have not tested
 *
 * @param matchSlug the slug from the nrl site
 */
export declare const getMatchEventSource: (matchSlug: string) => Promise<EventSource>;
export declare const getMatchesByRound: (round?: number) => Promise<INrlMatch[]>;
export {};
