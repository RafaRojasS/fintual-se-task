import {
    Stock,
    stockAvailable,
} from "./user-stock.types";

type stockActions = 'buy' | 'sell' | 'maintain';

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
    Portfolio,
    stockActions,
    RebalanceOutput,
}