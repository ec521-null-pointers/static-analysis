const handler = ([items]) => {
    if (Array.isArray(items)) {
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
        return items.flat();
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map