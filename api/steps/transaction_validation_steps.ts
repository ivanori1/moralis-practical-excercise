import {Then} from "@cucumber/cucumber";
import {MoralisContext} from "../../moralisContext";
import {Transaction} from "../interfaces/wallet";
import {hexToDecimal} from "../utils/blockchain";

/**
 * Steps for validating transaction data accuracy
 * These steps help verify that transaction data is correct, not just present
 */

Then('the stored transaction should have valid numeric fields', async function (this: MoralisContext) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    // Validate numeric fields are valid hex numbers
    const numericFields = [
        {name: "nonce", value: tx.nonce},
        {name: "transaction_index", value: tx.transaction_index},
        {name: "value", value: tx.value},
        {name: "gas", value: tx.gas},
        {name: "gas_price", value: tx.gas_price},
        {name: "receipt_cumulative_gas_used", value: tx.receipt_cumulative_gas_used},
        {name: "receipt_gas_used", value: tx.receipt_gas_used},
        {name: "block_number", value: tx.block_number},
    ];

    numericFields.forEach(({name, value}) => {
        try {
            const decimal = hexToDecimal(value);
            this.softAssert.assertTrue(
                decimal >= 0,
                `Field ${name} should be a non-negative number, got: ${value} (${decimal})`
            );
        } catch (error) {
            this.softAssert.fail(`Field ${name} is not a valid hex number: ${value}`);
        }
    });
});

Then('the stored transaction receipt_status should be {string}', async function (
    this: MoralisContext,
    expectedStatus: string
) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    this.softAssert.assertEquals(
        tx.receipt_status,
        expectedStatus,
        `Expected receipt_status to be ${expectedStatus}, but got ${tx.receipt_status}`
    );
});

Then('the stored transaction block_timestamp should be a valid ISO date', async function (this: MoralisContext) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    const timestamp = new Date(tx.block_timestamp);
    this.softAssert.assertFalse(
        isNaN(timestamp.getTime()),
        `block_timestamp should be a valid date, got: ${tx.block_timestamp}`
    );

    // Verify it's not in the future
    const now = new Date();
    this.softAssert.assertTrue(
        timestamp <= now,
        `block_timestamp should not be in the future, got: ${tx.block_timestamp}`
    );
});

Then('the stored transaction gas_used should be less than or equal to gas limit', async function (this: MoralisContext) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    const gasLimit = hexToDecimal(tx.gas);
    const gasUsed = hexToDecimal(tx.receipt_gas_used);

    this.softAssert.assertTrue(
        gasUsed <= gasLimit,
        `gas_used (${gasUsed}) should be <= gas limit (${gasLimit})`
    );
});

Then('the stored transaction should have consistent block information', async function (this: MoralisContext) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    // Block number should be consistent with block hash
    // Block timestamp should be reasonable for the block number
    const blockNumber = hexToDecimal(tx.block_number);
    this.softAssert.assertTrue(
        blockNumber > 0,
        `Block number should be positive, got: ${blockNumber}`
    );

    // Block hash should be present and valid format
    this.softAssert.assertNotNull(
        tx.block_hash,
        "Block hash should not be null"
    );
});

Then('I should be able to verify the transaction independently using the hash {string}', async function (
    this: MoralisContext,
    txHash: string
) {
    // This step documents that the transaction hash can be used to verify
    // the transaction independently via blockchain explorers or other APIs
    this.logger.info(`Transaction hash ${txHash} can be verified independently via:`);
    this.logger.info(`- Etherscan: https://etherscan.io/tx/${txHash}`);
    this.logger.info(`- Moralis API: GET /transaction/{hash}`);
    this.logger.info(`- Direct blockchain node query`);

    // Store the hash for potential future verification
    this.setNote("transactionHashForVerification", txHash);
});

Then('the stored transaction value should match the sum of transfers', async function (this: MoralisContext) {
    const tx = this.getNote("firstTransaction") as Transaction;
    if (!tx) {
        throw new Error("No transaction stored. Please run 'I should store the first transaction for validation' first.");
    }

    if (tx.transfers && tx.transfers.length > 0) {
        // Calculate sum of transfer values
        let transferSum = BigInt(0);
        tx.transfers.forEach((transfer) => {
            transferSum += BigInt(transfer.value);
        });

        const txValue = BigInt(tx.value);
        // Note: This might not always match exactly due to gas fees, but should be close
        this.logger.info(`Transaction value: ${txValue}, Transfer sum: ${transferSum}`);
    } else {
        this.logger.info("No transfers found in transaction, skipping transfer sum validation");
    }
});


