import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
 * but also works for objects
 */
declare const handler: FormulaHandler<Array<unknown> | Record<string, unknown>>;
export declare const getArgumentInputData: ([items]: unknown[], argIndex: number, input: any) => any;
export default handler;
