import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
 * but also works with objects
 */
export declare const handler: FormulaHandler<boolean>;
export default handler;
export declare const getArgumentInputData: ([items]: unknown[], argIndex: number, input: any) => any;
