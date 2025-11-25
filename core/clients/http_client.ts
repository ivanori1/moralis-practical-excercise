import {Response} from "node-fetch-cjs";
import fetch from "node-fetch-cjs";
import {MoralisContext} from "../../moralisContext";
import {HttpMethodEnum} from "../enums/http_method_enum";

export interface HttpClientOptions {
    headers?: { [key: string]: string };
    queryParameters?: { [key: string]: string };
    body?: unknown;
}

export class HttpClient {
    protected context: MoralisContext;
    protected path: string;
    protected method: HttpMethodEnum;
    protected options: HttpClientOptions;

    constructor(
        context: MoralisContext,
        path: string,
        method: HttpMethodEnum,
        options: HttpClientOptions = {}
    ) {
        this.context = context;
        this.path = path;
        this.method = method;
        this.options = options;
    }

    protected buildUrl(): string {
        const baseUrl = this.context.apiBaseUrl;
        let url = `${baseUrl}${this.path}`;

        if (this.options.queryParameters) {
            const queryString = Object.entries(this.options.queryParameters)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join("&");

            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return url;
    }

    protected buildCurlCommand(): string {
        const url = this.buildUrl();
        let curl = `curl -X ${this.method} "${url}"`;

        if (this.options.headers) {
            Object.entries(this.options.headers).forEach(([key, value]) => {
                curl += ` \\\n  -H "${key}: ${value}"`;
            });
        }

        if (this.options.body && this.method !== HttpMethodEnum.GET) {
            const bodyString = typeof this.options.body === "string"
                ? this.options.body
                : JSON.stringify(this.options.body);
            curl += ` \\\n  -d '${bodyString}'`;
        }

        return curl;
    }

    public async request(context: MoralisContext): Promise<Response> {
        const url = this.buildUrl();
        const curlCommand = this.buildCurlCommand();

        context.logger.info(`Making ${this.method} request to: ${url}`);
        context.logger.info(`cURL: ${curlCommand}`);

        const headers: Record<string, string> = { ...(this.options.headers || {}) };

        if (this.options.body && this.method !== HttpMethodEnum.GET) {
            if (!headers["Content-Type"]) {
                headers["Content-Type"] = "application/json";
            }
        }

        const fetchOptions = {
            method: this.method,
            headers: headers,
            body: this.options.body && this.method !== HttpMethodEnum.GET
                ? (typeof this.options.body === "string"
                    ? this.options.body
                    : JSON.stringify(this.options.body))
                : undefined,
        };

        try {
            const response = await fetch(url, fetchOptions);
            context.lastResponse = response;
            context.lastCurlCommand = curlCommand;

            // Parse response data
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                context.responseData = await response.json();
            } else {
                context.responseData = await response.text();
            }

            context.logger.info(`Response status: ${response.status} ${response.statusText}`);

            return response;
        } catch (error) {
            context.logger.error(`Request failed: ${error}`);
            throw error;
        }
    }
}

