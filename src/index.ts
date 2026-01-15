// Usage example

import { UserPortfolio } from "./portfolio";
import { UserStock } from "./user-stock";
import { generateAllocation } from "./utils";

// User stocks:
const stock1 = new UserStock('META', 10); // random stock prices
const stock2 = new UserStock('APPL', 15); // random stock prices
const stock3 = new UserStock('MSFT', 7, [4, 5, 12]); // fixed stock prices

const userStocks = [stock1, stock2, stock3];
const allocationObject = generateAllocation({[stock1.name]: 0.4, [stock2.name]: 0.45, [stock3.name]: 0.15})

console.log('\n=== Summary ===');
console.log(`Stocks: ${userStocks.length}`);
console.log('USER STOCKS', userStocks);
console.log('Allocation object:', allocationObject);

// User Portfolio
const userPortfolio = new UserPortfolio(userStocks, allocationObject);
const rebalanceResult = userPortfolio.rebalance();

console.log('\n\nAs your financial advisor, to achieve your allocations you should:')
rebalanceResult.forEach(stockRebalance => {
    const message = stockRebalance.quantity === 0 ?
        `> ${stockRebalance.action} the stocks of ${stockRebalance.stock}` :
        `> ${stockRebalance.action} ${stockRebalance.quantity} stocks of ${stockRebalance.stock}`;
    console.log(message);
})