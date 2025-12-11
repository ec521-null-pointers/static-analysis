const handler = (numbers) => {
    if (!Array.isArray(numbers) ||
        numbers.some((n) => n === null || typeof n !== 'number')) {
        return null;
    }
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition
    return numbers.reduce((result, n) => {
        return result + Number(n);
    }, 0);
};
export default handler;
//# sourceMappingURL=handler.js.map