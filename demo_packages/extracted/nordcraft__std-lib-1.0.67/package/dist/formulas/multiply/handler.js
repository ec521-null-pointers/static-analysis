const handler = (numbers) => {
    if (numbers.some((n) => isNaN(Number(n)))) {
        return null;
    }
    return numbers.reduce(
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication
    (product, num) => product * num, 1);
};
export default handler;
//# sourceMappingURL=handler.js.map