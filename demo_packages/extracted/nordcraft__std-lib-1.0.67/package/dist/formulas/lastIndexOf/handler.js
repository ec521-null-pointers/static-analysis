const handler = ([collection, item]) => {
    if (typeof collection === 'string') {
        return collection.lastIndexOf(item);
    }
    if (Array.isArray(collection)) {
        return collection.findLastIndex((i) => globalThis.toddle.isEqual(i, item));
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map