import {World} from "@cucumber/cucumber";
import {CustomLogger} from "./core/utils/logger";
import {Response} from "node-fetch-cjs";
import {SoftAssert} from "./core/utils/softAssert";

export class MoralisContext extends World {
    public softAssert: SoftAssert;
    public logger!: CustomLogger;
    public apiBaseUrl: string;
    public lastResponse: Response | undefined;
    public lastCurlCommand?: string;
    public responseData: unknown;
    public apiKey: string;
    private notes: Map<string, unknown> = new Map();

    constructor(options: ConstructorParameters<typeof World>[0]) {
        super(options);
        this.logger = new CustomLogger();
        this.softAssert = new SoftAssert();
        
        // Moralis API base URL - ensure it ends with / for proper URL construction
        const baseUrl = process.env.MORALIS_API_BASE_URL || "https://deep-index.moralis.io/api/v2.2";
        this.apiBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        
        // API Key from environment variable
        this.apiKey = process.env.MORALIS_API_KEY || "";
        
        if (!this.apiKey) {
            this.logger.warn("⚠️ MORALIS_API_KEY not set. Please set it in your environment variables.");
        }
    }

    public setNote(key: string, value: unknown): void {
        this.notes.set(key, value);
    }

    public getNote(key: string): unknown {
        return this.notes.get(key);
    }
}

