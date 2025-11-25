import {After, AfterAll, AfterStep, Before, BeforeAll, Status} from "@cucumber/cucumber";
import {config} from "dotenv";

import {MoralisContext} from "../../moralisContext";
import "./world";

BeforeAll(async function () {
    config();
});

Before(async function (this: MoralisContext, scenario) {
    this.logger.info(`=== Starting scenario: ${scenario.pickle.name} ===`);
});

AfterStep(async function (this: MoralisContext, step) {
    const stepText = step.pickleStep.text;
    const status = step.result?.status;
    const duration = step.result?.duration?.seconds || 0;

    if (status === Status.FAILED) {
        const errorMessage = step.result?.exception?.message || "Unknown error";
        const stackTrace = step.result?.exception?.stackTrace?.split('\n') || [];

        this.logger.error(`❌ Step Failed: "${stepText}"`);
        this.logger.error(`   ├─ Error: ${errorMessage}`);
        for (const index of stackTrace) {
            this.logger.error(`   ├─ Stack Trace: ${index}`);
        }

        if (this.lastCurlCommand) {
            this.logger.error(`   ├─ cURL: ${this.lastCurlCommand}`);
            this.attach(this.lastCurlCommand, 'text/plain');
        }

    } else if (status === Status.PASSED) {
        this.logger.info(`✅ Step Passed: "${stepText}" (Duration: ${duration}s)`);
    } else if (status === Status.SKIPPED) {
        this.logger.warn(`⚠️ Step Skipped: "${stepText}"`);
    }
});

After(async function (this: MoralisContext, scenario) {
    const status = scenario.result?.status;
    const duration = scenario.result?.duration?.seconds || 0;

    // Check for soft assertion errors and throw them if any exist
    if (this.softAssert.hasErrors()) {
        const errors = this.softAssert.getErrors();
        this.logger.error(`🚨 SCENARIO FAILED: ${scenario.pickle.name} (Duration: ${duration}s)`);
        this.logger.error(`   Soft assertion errors:`);
        errors.forEach((error, index) => {
            this.logger.error(`   ${index + 1}. ${error}`);
        });
        // throwIfErrors will reset errors, so we don't need to reset again
        this.softAssert.throwIfErrors();
        return; // Exit early since we're throwing an error
    }

    if (status === Status.FAILED) {
        this.logger.error(`🚨 SCENARIO FAILED: ${scenario.pickle.name} (Duration: ${duration}s)`);
    } else {
        this.logger.info(`✅ SCENARIO PASSED: ${scenario.pickle.name} (Duration: ${duration}s)`);
    }
    
    this.softAssert.resetErrors();
});

AfterAll(async function () {
    // Cleanup if needed
});


