import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
 * but returns searchParams as an object and path as an array without leading empty string
 */
declare const handler: FormulaHandler<{
    hostname: string;
    searchParams: {
        [k: string]: string;
    };
    path: string[];
    hash: string;
    href: string;
    protocol: string;
    port: string;
    origin: string;
}>;
export default handler;
