export const DEFAULT_STEP_TIMEOUT = 30_000; 
export const TEST_WALLET_ADDRESSES = {
    ETHEREUM: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik's address
    EMPTY_WALLET: "0x0000000000000000000000000000000000000000",
};

// Chain types supported by Moralis
export const CHAIN_TYPES = {
    ETHEREUM: "eth",
    POLYGON: "polygon",
    BSC: "bsc",
    AVALANCHE: "avalanche",
    FANTOM: "fantom",
    CRONOS: "cronos",
    ARBITRUM: "arbitrum",
    OPTIMISM: "optimism",
} as const;


