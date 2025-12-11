import type { FormulaHandler } from '@nordcraft/core/dist/types';
/**
 * Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
 * but requires the input to be an array of objects with `key` and `value` properties named as `key` and `value` respectively
 */
declare const handler: FormulaHandler<Record<string, unknown>>;
export default handler;
