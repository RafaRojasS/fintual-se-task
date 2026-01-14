function generateAllocation(stocksAllocations: Record<string, number>) {
    const allocationValues = Object.values(stocksAllocations).reduce((acc, val) => {
        return acc+val;
    }, 0)
    if (allocationValues !== 1) throw new Error('Allocations must add 1 (100%)')
    
    return stocksAllocations;
}

export {
    generateAllocation,
}