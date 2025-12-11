/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
 * and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
 */
const handler = ([collection, item]) => {
    if (typeof collection === 'string') {
        return collection.indexOf(item);
    }
    if (Array.isArray(collection)) {
        return collection.findIndex((i) => globalThis.toddle.isEqual(i, item));
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map