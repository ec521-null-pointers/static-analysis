import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 * but this implementation also supports objects
 */
export declare const handler: FormulaHandler<Array<unknown> | Record<string, unknown>>;
export default handler;
export declare const getArgumentInputData: ([items]: unknown[], argIndex: number, input: any) => any;
