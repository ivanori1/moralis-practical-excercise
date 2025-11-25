import {setDefaultTimeout, setWorldConstructor} from "@cucumber/cucumber";

import {DEFAULT_STEP_TIMEOUT} from "../constants";
import {MoralisContext} from "../../moralisContext";

setWorldConstructor(MoralisContext);
setDefaultTimeout(DEFAULT_STEP_TIMEOUT);

process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});


