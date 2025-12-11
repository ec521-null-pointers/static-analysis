const handler = ([id], { root }) => {
    if (typeof id !== 'string') {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
    return root.getElementById(id);
};
export default handler;
//# sourceMappingURL=handler.js.map