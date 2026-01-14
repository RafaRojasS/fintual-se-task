type stockAvailable = string;

interface Stock {
    name: stockAvailable;
    priceHistory: number[];
    quantity: number;
    getCurrentPrice(): number;
}

export {
    Stock,
    stockAvailable,
}