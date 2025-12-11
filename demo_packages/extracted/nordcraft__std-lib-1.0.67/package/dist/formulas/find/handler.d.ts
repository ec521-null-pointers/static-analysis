import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 * but this implementation also supports objects
 */
export declare const handler: FormulaHandler<unknown>;
export default handler;
export declare const getArgumentInputData: ([items]: unknown[], argIndex: number, input: any) => any;
