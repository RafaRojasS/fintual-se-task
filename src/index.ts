// Usage example

import { UserPortfolio } from "./portfolio";
import { UserStock } from "./user-stock";
import { generateAllocation } from "./utils";

// User stocks:
const stock1 = new UserStock('META', 10); // random stock prices
const stock2 = new UserStock('APPL', 15); // random stock prices
const stock3 = new UserStock('MSFT', 7, [4, 5, 12]); // fixed stock prices

console.log('STOCK PRICES:')
console.log(stock1.name, ' ', stock1.priceHistory);
console.log(stock2.name, ' ', stock2.priceHistory);
console.log(stock3.name, ' ', stock3.priceHistory);

// Allocations (must add 1, otherwise it will throw an error)
const allocations = generateAllocation({[stock1.name]: 0.4, [stock2.name]: 0.45, [stock3.name]: 0.15})

// User Portfolio
const user = new UserPortfolio([stock1, stock2, stock3], allocations);
console.log('\nRebalance:')
console.log(user.rebalance());