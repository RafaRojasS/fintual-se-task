import inquirer from 'inquirer';
import { UserStock } from './user-stock';
import { UserPortfolio } from './portfolio';
import { generateAllocation } from './utils';

const userStocks: UserStock[] = [];
const usedNames: Set<string> = new Set();

/**
 * Prompts the user to input stock data.
 * It asks for the stock name, quantity and optionally price history.
 * Validates that names are unique, quantities are positive and prices are positive.
 */
async function promptForStock(): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter stock name:',
            validate: (input: string) => {
                if(!input.trim()) {
                    return 'Name cannot be empty';
                }
                if(usedNames.has(input.trim().toLowerCase())) {
                    return 'Stock name must be unique';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Enter quantity:',
            validate: (input: string) => {
                const num = Number(input);
                if(isNaN(num) || num <= 0) {
                    return 'Quantity must be a positive number';
                }
                return true;
            }
        },
        {
            type: 'confirm',
            name: 'addPriceHistory',
            message: 'Do you want to add price history?',
            default: false
        }
    ]);

    let priceHistory: number[] | undefined;

    if(answers.addPriceHistory) {
        const priceAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'prices',
                message: 'Enter prices separated by commas (e.g., 10,20,30):',
                validate: (input: string) => {
                    if(!input.trim()) {
                        return 'Please enter at least one price';
                    }
                    const prices = input.split(',').map(p => p.trim());
                    for(const price of prices) {
                        const num = Number(price);
                        if(isNaN(num) || num <= 0) {
                            return 'All prices must be positive numbers';
                        }
                    }
                    return true;
                }
            }
        ]);
        priceHistory = priceAnswers.prices.split(',').map((price: string) => Number(price.trim()));
    }

    const name = answers.name.trim();
    const quantity = Number(answers.quantity);

    usedNames.add(name.toLowerCase());
    userStocks.push(new UserStock(name, quantity, priceHistory));

    console.log(`\nStock "${name}" added successfully!`);
}

/**
 * Prompts the user to input allocation for each stock.
 * Validates that allocations are between 0 and 1, and that the sum equals 1.
 * Returns the allocation object or null if the user cancels.
 */
async function promptForAllocations(): Promise<Record<string, number> | null> {
    console.log('\n=== Allocation Setup ===');
    console.log('Enter allocation for each stock (decimal between 0 and 1).');
    console.log('The sum of all allocations must equal 1.\n');

    let allocations: Record<string, number> = {};
    let validAllocations = false;

    while(!validAllocations) {
        allocations = {};
        let allocationTotal = 0;

        for(let i = 0; i < userStocks.length; i++) {
            const stock = userStocks[i];
            const remaining = Number((1-allocationTotal).toFixed(4));

            const { allocation } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'allocation',
                    message: `Enter allocation for "${stock.name}" (remaining: ${remaining}):`,
                    validate: (input: string) => {
                        const num = Number(input);
                        if(isNaN(num)) {
                            return 'Allocation must be a number';
                        }
                        if(num < 0 || num > 1) {
                            return 'Allocation must be between 0 and 1';
                        }
                        return true;
                    }
                }
            ]);

            const allocationValue = Number(allocation);
            allocations[stock.name] = allocationValue;
            allocationTotal += allocationValue;
        }

        const total = Object.values(allocations).reduce((acc, allocationValue) => {
            return acc+allocationValue;
        }, 0)
        const roundedTotal = Math.round(total*10000) / 10000;

        if(roundedTotal !== 1) {
            console.log(`\nError: Allocations sum to ${roundedTotal}, but must equal 1.`);
            const { retry } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'retry',
                    message: 'Do you want to re-enter the allocations?',
                    default: true
                }
            ]);

            if(!retry) {
                console.log('Exiting without creating allocation.');
                return null;
            }
        } else {
            validAllocations = true;
        }
    }

    return allocations;
}

/**
 * Main CLI function.
 * Prompts the user to create stocks, then allocations, and finally displays the rebalance result.
 */
async function main(): Promise<void> {
    console.log('=== Stock Portfolio CLI ===\n');

    let addMore = true;

    while(addMore) {
        await promptForStock();

        const { continueAdding } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continueAdding',
                message: 'Do you want to add another stock?',
                default: true
            }
        ]);

        addMore = continueAdding;
    }

    console.log('\n=== Created Stocks ===');
    userStocks.forEach((stock, index) => {
        console.log(`${index+1}. ${stock.name} - Quantity: ${stock.quantity}, Price History: [${stock.priceHistory.join(', ')}]`);
    });
    console.log(`\nTotal stocks created: ${userStocks.length}`);

    const allocations = await promptForAllocations();
    if(!allocations) return;

    const allocationObject = generateAllocation(allocations);

    console.log('\n=== Allocation Created ===');
    Object.entries(allocationObject).forEach(([name, value]) => {
        console.log(`${name}: ${(value*100).toFixed(2)}%`);
    });

    console.log('\n=== Summary ===');
    console.log(`Stocks: ${userStocks.length}`);
    console.log('USER STOCKS', userStocks);
    console.log('Allocation object:', allocationObject);

    // User Portfolio
    const userPortfolio = new UserPortfolio(userStocks, allocationObject);
    const rebalanceResult = userPortfolio.rebalance();

    console.log('\n\nAs your financial advisor, to achieve your allocation you should:')
    rebalanceResult.forEach(stockRebalance => {
        const message = stockRebalance.quantity === 0 ?
            `> ${stockRebalance.action} the stocks of ${stockRebalance.stock}` :
            `> ${stockRebalance.action} ${stockRebalance.quantity} stocks of ${stockRebalance.stock}`;
        console.log(message);
    })
}

main().catch(console.error);

export {
    userStocks,
}
