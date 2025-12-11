const handler = ([list]) => {
    if (Array.isArray(list)) {
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
        return [...list].reverse();
    }
    return null;
};
export default handler;
//# sourceMappingURL=handler.js.map