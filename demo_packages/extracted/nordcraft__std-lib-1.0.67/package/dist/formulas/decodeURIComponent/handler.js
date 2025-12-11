const handler = ([URIComponent]) => {
    if (typeof URIComponent !== 'string') {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
    return decodeURIComponent(URIComponent);
};
export default handler;
//# sourceMappingURL=handler.js.map