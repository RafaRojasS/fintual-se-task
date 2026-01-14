import {
    Stock,
    stockAvailable,
} from "./user-stock.types";

/**
 * User Stock class.
 * It stores the stock name, price history and the quantity owned by the user.
 * If there is no price history input on the constructor, it generates a random
 * set of values per stock, as the stock price history, 
 */
class UserStock implements Stock {
    name: stockAvailable;
    quantity: number;
    priceHistory: number[];

    constructor(name: stockAvailable, quantity: number, priceHistory?: number[]) {
        this.name = name;
        this.quantity = quantity;
        this.priceHistory = priceHistory || [Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1];
    }

    getCurrentPrice(): number {
        return this.priceHistory[this.priceHistory.length - 1];
    }
}

export {
    UserStock,
}