const handler = ([list, value]) => {
    if (!Array.isArray(list)) {
        return null;
    }
    // Similar to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    return [...list, value];
};
export default handler;
//# sourceMappingURL=handler.js.map