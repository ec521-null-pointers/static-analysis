const handler = ([input]) => {
    if (typeof input !== 'string') {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase
    return input.toLocaleUpperCase();
};
export default handler;
//# sourceMappingURL=handler.js.map