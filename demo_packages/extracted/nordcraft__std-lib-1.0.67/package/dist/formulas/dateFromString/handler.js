const handler = ([date]) => {
    if (typeof date === 'string') {
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
        return new Date(date);
    }
    else {
        return null;
    }
};
export default handler;
//# sourceMappingURL=handler.js.map