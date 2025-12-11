const handler = ([list, value]) => {
    if (!Array.isArray(list)) {
        return null;
    }
    return [value, ...list];
};
export default handler;
//# sourceMappingURL=handler.js.map