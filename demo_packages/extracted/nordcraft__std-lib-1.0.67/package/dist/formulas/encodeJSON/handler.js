const handler = ([data, indent]) => {
    if (typeof indent !== 'number') {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    return JSON.stringify(data, null, indent);
};
export default handler;
//# sourceMappingURL=handler.js.map