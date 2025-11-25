/**
 * Utility functions for blockchain data validation
 */

/**
 * Validates Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validates block hash format
 */
export function isValidBlockHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Converts Wei to Ether
 */
export function weiToEther(wei: string): string {
    const weiBigInt = BigInt(wei);
    const etherBigInt = weiBigInt / BigInt(10 ** 18);
    const remainder = weiBigInt % BigInt(10 ** 18);
    return `${etherBigInt}.${remainder.toString().padStart(18, '0')}`;
}

/**
 * Validates that a value is a valid hex string representing a number
 */
export function isValidHexNumber(value: string): boolean {
    return /^0x[a-fA-F0-9]+$/.test(value);
}

/**
 * Converts hex string to decimal number
 */
export function hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
}


