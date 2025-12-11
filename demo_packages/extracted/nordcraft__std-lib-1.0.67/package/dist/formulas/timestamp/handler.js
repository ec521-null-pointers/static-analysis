const handler = ([date]) => {
    if (!date || !(date instanceof Date)) {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
    return date.getTime();
};
export default handler;
//# sourceMappingURL=handler.js.map