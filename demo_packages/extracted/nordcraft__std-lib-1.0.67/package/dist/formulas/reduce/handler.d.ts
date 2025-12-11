import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 * but also works with objects
 */
declare const handler: FormulaHandler<unknown>;
export default handler;
export declare const getArgumentInputData: ([items, _, result]: unknown[], argIndex: number, input: any) => any;
