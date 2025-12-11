/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
 * and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
 */
const handler = ([collection, item]) => {
    if (typeof collection === 'string' && typeof item === 'string') {
        return collection.includes(item);
    }
    if (Array.isArray(collection)) {
        return collection.some((collectionItem) => globalThis.toddle.isEqual(collectionItem, item));
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map