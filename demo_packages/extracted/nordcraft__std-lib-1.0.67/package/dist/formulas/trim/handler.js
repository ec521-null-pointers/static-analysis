const handler = ([str]) => {
    if (typeof str !== 'string') {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
    return str.trim();
};
export default handler;
//# sourceMappingURL=handler.js.map