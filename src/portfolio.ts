import {
    Portfolio,
    stockActions,
    RebalanceOutput,
} from "./portfolio.types";
import {
    Stock,
    stockAvailable,
} from "./user-stock.types";

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
     * Calculates the quantity difference From the allocation target.
     * It first calculates the stock total value (# stocks * stock current price), the ratio between
     * the stock total value relative to the user's portfolio (total value / portfolio value) and the
     * value that the stock should aim to reach the allocation target (total value * stock target allocation / actual allocation).
     * Then it calculates the quantity difference to reach the allocation target, in amount of stocks.
     * @param stock 
     * @param portfolioTotalValue 
     * @returns {number} quantity difference
     */
    private getQuantityDifferenceFromTarget(stock: Stock, portfolioTotalValue: number): number {
        const stockTotalValue = stock.getCurrentPrice()*stock.quantity;
        const allocationNow = stockTotalValue / portfolioTotalValue;
        const targetValue = stockTotalValue * this.stocksAllocation[stock.name] / allocationNow;

        const quantityDifferenceFromTarget = (targetValue - stockTotalValue) / stock.getCurrentPrice();

        return quantityDifferenceFromTarget;
    }

    /**
     * Gets the action for a stock when rebalancing.
     * Depending if the target is positive or negative (or zero), the action will be sell, buy or maintain.
     * @param quantityDifferenceFromTarget 
     * @returns {stockActions} action for the stock
     */
    private getStockAction(quantityDifferenceFromTarget: number): stockActions {
        let action: stockActions = 'maintain';
        const roundedQuantity = Math.round(quantityDifferenceFromTarget);
        if(roundedQuantity > 0) action = 'buy';
        else if(roundedQuantity < 0) action = 'sell';

        return action;
    }

    /**
     * Gives a rebalanced portfolio of the user's stocks to its allocation values, based on the stocks current prices.
     * The amount of stocks is a rounded value, assuming that a stock can only be sold or bought in integers (can't buy half a stock)
     * @returns {RebalanceOutput[]} list of actions to do and amounts of stocks to do 
     */
    rebalance(): RebalanceOutput[] {
        const portfolioTotalValue = this.stocks.reduce((acc, value) => {
            return acc + value.getCurrentPrice()*value.quantity;
        }, 0)

        const actions = this.stocks.map(stock => {
            const quantityDifferenceFromTarget = this.getQuantityDifferenceFromTarget(stock, portfolioTotalValue);

            let action = this.getStockAction(quantityDifferenceFromTarget);

            return {
                stock: stock.name,
                action,
                quantity: Math.round(Math.abs(quantityDifferenceFromTarget)),
            }
        })

        return actions;
    }
}

export {
    UserPortfolio,
}