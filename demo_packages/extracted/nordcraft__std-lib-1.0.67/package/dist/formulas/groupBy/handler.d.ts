import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
 */
export declare const handler: FormulaHandler<Record<string, Array<unknown>>>;
export default handler;
export declare const getArgumentInputData: ([items]: unknown[], argIndex: number, input: any) => any;
