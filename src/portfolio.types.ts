
type stockAvailable = string;
type stockActions = 'buy' | 'sell' | 'maintain';

interface Stock {
    name: stockAvailable;
    priceHistory: number[];
    quantity: number;
    getCurrentPrice(): number;
}

interface RebalanceOutput {
    stock: stockAvailable;
    action: stockActions;
    quantity: number;
}
interface Portfolio {
    stocks: Stock[];
    stocksAllocation: Record<stockAvailable, number>;
    rebalance(): RebalanceOutput[];
}

export {
    Stock,
    Portfolio,
    stockActions,
    stockAvailable,
    RebalanceOutput,
}