import {
    Stock,
    Portfolio,
    stockActions,
    stockAvailable,
    RebalanceOutput,
} from "./portfolio.types";
import { generateAllocation } from "./utils";

/**
 * User Stock class.
 * It stores the stock name, price history and the quantity owned by the user.
 * If there is no price history input on the constructor, it generates a random
 * set of values per stock, as the stock price history, 
 */
class UserStock implements Stock {
    name: stockAvailable;
    priceHistory: number[];
    quantity: number;

    constructor(name: stockAvailable, quantity: number, priceHistory?: number[]) {
        this.name = name;
        this.quantity = quantity;
        this.priceHistory = priceHistory || [Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1];
    }

    getCurrentPrice(): number {
        return this.priceHistory[this.priceHistory.length - 1];
    }
}

/**
 * User Portfolio class.
 * It has a list of the user stocks and the user allocation. It also has a rebalance method, that
 * indicates to the user the actions of each stock (sell, buy, maintain) to perform based on the
 * current price of each stock and the allocation defined on the portfolio.
 */
class UserPortfolio implements Portfolio {
    stocks: Stock[];
    stocksAllocation: Record<stockAvailable, number>;

    constructor(stocks: Stock[], stocksAllocation: Record<stockAvailable, number>) {
        this.stocks = stocks;
        this.stocksAllocation = stocksAllocation;
    }

    /**
     * Gives a rebalanced portfolio of the user's stocks to its allocation values, based on the stocks current prices.
     * It first calculates the stock total value (# stocks * stock current price), the ratio between
     * the stock total value relative to the user's portfolio (total value / portfolio value) and the
     * value that the stock should aim to reach the allocation target (total value * stock target allocation / actual allocation).
     * Then it calculates the quantity difference to reach the allocation target, in amount of stocks. Depending if
     * the target is positive or negative (or zero), the action will be sell, buy or maintain.
     * The amount of stocks is a rounded value, assuming that a stock can only be sold or bought in integers (can't buy half a stock)
     * @returns {RebalanceOutput[]} list of actions to do and amounts of stocks to do 
     */
    rebalance(): RebalanceOutput[] {
        const portfolioTotalValue = this.stocks.reduce((acc, value) => {
            return acc + value.getCurrentPrice()*value.quantity;
        }, 0)

        const actions = this.stocks.map(stock => {
            const stockTotalValue = stock.getCurrentPrice()*stock.quantity;
            const allocationNow = stockTotalValue / portfolioTotalValue;
            const targetValue = stockTotalValue * this.stocksAllocation[stock.name] / allocationNow;

            const quantityDifferenceFromTarget = (targetValue - stockTotalValue) / stock.getCurrentPrice();

            let action: stockActions = 'maintain';
            if(quantityDifferenceFromTarget > 0) action = 'buy';
            else if(quantityDifferenceFromTarget < 0) action = 'sell';

            return {
                stock: stock.name,
                action,
                quantity: Math.round(Math.abs(quantityDifferenceFromTarget)),
            }
        })

        return actions;
    }
}

// Usage example

// User stocks:
const stock1 = new UserStock('META', 10);
const stock2 = new UserStock('APPL', 15);
const stock3 = new UserStock('EXA', 7, [4, 5, 12]);

// Allocations (must add 1, otherwise it will throw an error)
const allocations = generateAllocation({[stock1.name]: 0.4, [stock2.name]: 0.45, [stock3.name]: 0.15})

// User Portfolio
const user = new UserPortfolio([stock1, stock2, stock3], allocations);
console.log(user.rebalance());