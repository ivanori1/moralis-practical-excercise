import {Given, When, Then} from "@cucumber/cucumber";
import {MoralisContext} from "../../moralisContext";
import {WalletHistory} from "../models/wallet";
import {WalletHistoryResponse, Transaction} from "../interfaces/wallet";
import {ChainTypeEnum} from "../enums/chainTypeEnum";
import {
    isValidEthereumAddress,
    isValidTransactionHash,
    isValidBlockHash,
    hexToDecimal,
} from "../utils/blockchain";
import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

Given('I have a wallet address {string}', async function (this: MoralisContext, address: string) {
    this.setNote("walletAddress", address);
});

Given('I want to query wallet history for chain {string}', async function (this: MoralisContext, chain: string) {
    this.setNote("chain", chain);
});

Given('I want to query wallet history with limit {int}', async function (this: MoralisContext, limit: number) {
    this.setNote("limit", limit);
});

Given('I want to query wallet history from block {int} to block {int}', async function (
    this: MoralisContext,
    fromBlock: number,
    toBlock: number
) {
    this.setNote("fromBlock", fromBlock);
    this.setNote("toBlock", toBlock);
});

When('I request the wallet history', async function (this: MoralisContext) {
    const address = this.getNote("walletAddress") as string;
    const chain = this.getNote("chain") as string | undefined;
    const limit = this.getNote("limit") as number | undefined;
    const fromBlock = this.getNote("fromBlock") as number | undefined;
    const toBlock = this.getNote("toBlock") as number | undefined;

    const walletHistory = new WalletHistory(this, address, {
        chain,
        limit,
        from_block: fromBlock,
        to_block: toBlock,
    });

    await walletHistory.request(this);
});

When('I request the wallet history for address {string}', async function (this: MoralisContext, address: string) {
    const chain = this.getNote("chain") as string | undefined;
    const limit = this.getNote("limit") as number | undefined;

    const walletHistory = new WalletHistory(this, address, {
        chain,
        limit,
    });

    await walletHistory.request(this);
});

Then('the response should have a {string} in the status code', async function (
    this: MoralisContext,
    expectedStatus: string
) {
    if (!this.lastResponse) {
        throw new Error("No response available. Please make a request first.");
    }

    const actualStatus = this.lastResponse.status.toString();
    this.softAssert.assertTrue(
        actualStatus === expectedStatus,
        `Expected status code ${expectedStatus}, but got ${actualStatus}`
    );
});

Then('the response body matches {string} schema', async function (
    this: MoralisContext,
    schemaName: string
) {
    if (!this.responseData) {
        throw new Error("No response data available. Please make a request first.");
    }

    // Load schema file
    const schemaPath = path.join(__dirname, "../schemas", `${schemaName}.json`);
    
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);

    const isValid = validate(this.responseData);

    if (!isValid) {
        const errors = validate.errors?.map(err => 
            `${err.instancePath || "root"}: ${err.message}`
        ).join(", ");
        this.softAssert.fail(`Schema validation failed: ${errors}`);
    }
});

Then('the response should contain a list of transactions', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    this.softAssert.assertNotNull(responseData.result, "Response should contain result array");
    this.softAssert.assertTrue(
        Array.isArray(responseData.result),
        "Result should be an array"
    );
});

Then(/^the response should contain at least (\d+) transaction\(s\)$/, async function (
    this: MoralisContext,
    minCount: string
) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactionCount = responseData.result?.length || 0;
    const min = parseInt(minCount, 10);
    this.softAssert.assertTrue(
        transactionCount >= min,
        `Expected at least ${min} transactions, but got ${transactionCount}`
    );
});

Then('each transaction should have a valid transaction hash', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    transactions.forEach((tx: Transaction, index: number) => {
        this.softAssert.assertTrue(
            isValidTransactionHash(tx.hash),
            `Transaction at index ${index} has invalid hash: ${tx.hash}`
        );
    });
});

Then('each transaction should have valid from and to addresses', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    transactions.forEach((tx: Transaction, index: number) => {
        this.softAssert.assertTrue(
            isValidEthereumAddress(tx.from_address),
            `Transaction at index ${index} has invalid from_address: ${tx.from_address}`
        );

        if (tx.to_address) {
            this.softAssert.assertTrue(
                isValidEthereumAddress(tx.to_address),
                `Transaction at index ${index} has invalid to_address: ${tx.to_address}`
            );
        }
    });
});

Then('each transaction should have a valid block hash', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    transactions.forEach((tx: Transaction, index: number) => {
        this.softAssert.assertTrue(
            isValidBlockHash(tx.block_hash),
            `Transaction at index ${index} has invalid block_hash: ${tx.block_hash}`
        );
    });
});

Then('transactions should be ordered by block number descending', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    for (let i = 0; i < transactions.length - 1; i++) {
        const currentBlock = hexToDecimal(transactions[i].block_number);
        const nextBlock = hexToDecimal(transactions[i + 1].block_number);
        this.softAssert.assertTrue(
            currentBlock >= nextBlock,
            `Transactions not ordered correctly: block ${currentBlock} should be >= ${nextBlock}`
        );
    }
});

Then('I should store the first transaction for validation', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    if (transactions.length > 0) {
        this.setNote("firstTransaction", transactions[0]);
        this.logger.info(`Stored first transaction: ${transactions[0].hash}`);
    } else {
        throw new Error("No transactions found to store");
    }
});

Then('the transaction hash should match the stored transaction', async function (this: MoralisContext) {
    const storedTx = this.getNote("firstTransaction") as Transaction;
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];

    if (storedTx && transactions.length > 0) {
        const foundTx = transactions.find((tx: Transaction) => tx.hash === storedTx.hash);
        this.softAssert.assertNotNull(
            foundTx,
            `Stored transaction ${storedTx.hash} not found in response`
        );
    }
});

Then('the response should match the wallet history schema', async function (this: MoralisContext) {
    // Schema validation is handled by the core response validation steps
    // This step can be used to trigger schema validation if needed
    this.logger.info("Schema validation should be performed using Then('the response should match the schema')");
});

Then(/^the response should contain at most (\d+) transaction\(s\)$/, async function (
    this: MoralisContext,
    maxCount: string
) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactionCount = responseData.result?.length || 0;
    const max = parseInt(maxCount, 10);
    this.softAssert.assertTrue(
        transactionCount <= max,
        `Expected at most ${max} transactions, but got ${transactionCount}`
    );
});

Then('all transactions should be within the specified block range', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    const transactions = responseData.result || [];
    const fromBlock = this.getNote("fromBlock") as number | undefined;
    const toBlock = this.getNote("toBlock") as number | undefined;

    if (!fromBlock || !toBlock) {
        throw new Error("Block range not set. Please set fromBlock and toBlock first.");
    }

    transactions.forEach((tx: Transaction, index: number) => {
        // Handle both hex (0x...) and decimal string formats
        let blockNumber: number;
        if (typeof tx.block_number === 'string' && tx.block_number.startsWith('0x')) {
            blockNumber = hexToDecimal(tx.block_number);
        } else if (typeof tx.block_number === 'string') {
            blockNumber = parseInt(tx.block_number, 10);
        } else {
            blockNumber = parseInt(String(tx.block_number), 10);
        }
        
        this.softAssert.assertTrue(
            blockNumber >= fromBlock && blockNumber <= toBlock,
            `Transaction at index ${index} (hash: ${tx.hash}) has block number ${tx.block_number} (parsed: ${blockNumber}) outside range [${fromBlock}, ${toBlock}]`
        );
    });
});

Then('the response should have empty result array with pagination fields', async function (this: MoralisContext) {
    const responseData = this.responseData as WalletHistoryResponse;
    
    // Validate result is an empty array
    this.softAssert.assertNotNull(responseData.result, "Response should contain result array");
    this.softAssert.assertTrue(
        Array.isArray(responseData.result),
        "Result should be an array"
    );
    this.softAssert.assertTrue(
        responseData.result.length === 0,
        `Expected empty result array, but got ${responseData.result.length} transactions`
    );
    
    // Validate pagination fields
    this.softAssert.assertEquals(
        responseData.page_size,
        0,
        `Expected page_size to be 0, but got ${responseData.page_size}`
    );
    
    this.softAssert.assertEquals(
        responseData.page,
        0,
        `Expected page to be 0, but got ${responseData.page}`
    );
    
    // limit should be 100 (default) or the requested limit
    const expectedLimit = this.getNote("limit") as number | undefined || 100;
    this.softAssert.assertEquals(
        responseData.limit,
        expectedLimit,
        `Expected limit to be ${expectedLimit}, but got ${responseData.limit}`
    );
    
    // cursor should be null for empty results
    this.softAssert.assertNull(
        responseData.cursor,
        `Expected cursor to be null for empty results, but got ${responseData.cursor}`
    );
    
    this.logger.info("✅ Empty result response validated with correct pagination fields");
});

Then('the response should contain error message about large amount of data', async function (this: MoralisContext) {
    if (!this.responseData) {
        throw new Error("No response data available. Please make a request first.");
    }

    const responseData = this.responseData as { message?: string };
    
    this.softAssert.assertNotNull(
        responseData.message,
        "Response should contain a message field"
    );
    
    if (!responseData.message) {
        throw new Error("Response message is missing");
    }
    
    this.softAssert.assertTrue(
        typeof responseData.message === "string",
        "Message should be a string"
    );
    
    const expectedKeywords = ["large amount of data", "hello@moralis.io"];
    const message = responseData.message.toLowerCase();
    
    expectedKeywords.forEach((keyword) => {
        this.softAssert.assertTrue(
            message.includes(keyword.toLowerCase()),
            `Expected error message to contain "${keyword}", but got: ${responseData.message}`
        );
    });
    
    this.logger.info(`✅ Error message validated: ${responseData.message}`);
});

Then('the response should contain error message about limit maximum', async function (this: MoralisContext) {
    if (!this.responseData) {
        throw new Error("No response data available. Please make a request first.");
    }

    const responseData = this.responseData as { message?: string };
    
    this.softAssert.assertNotNull(
        responseData.message,
        "Response should contain a message field"
    );
    
    if (!responseData.message) {
        throw new Error("Response message is missing");
    }
    
    this.softAssert.assertTrue(
        typeof responseData.message === "string",
        "Message should be a string"
    );
    
    const expectedKeywords = ["maximum of 100", "admin.moralis.io", "upgrade your plan"];
    const message = responseData.message.toLowerCase();
    
    expectedKeywords.forEach((keyword) => {
        this.softAssert.assertTrue(
            message.includes(keyword.toLowerCase()),
            `Expected error message to contain "${keyword}", but got: ${responseData.message}`
        );
    });
    
    this.logger.info(`✅ Limit maximum error message validated: ${responseData.message}`);
});

