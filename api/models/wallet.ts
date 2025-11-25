import {HttpClient} from "../../core/clients/http_client";
import {HttpMethodEnum} from "../../core/enums/http_method_enum";
import {MoralisContext} from "../../moralisContext";
import {WalletHistoryQueryParams} from "../interfaces/wallet";

export class WalletHistory extends HttpClient {
    constructor(
        context: MoralisContext,
        address: string,
        queryParams?: WalletHistoryQueryParams
    ) {
        const headers: { [key: string]: string } = {
            "X-API-Key": context.apiKey,
            "Accept": "application/json",
        };

        // Build query parameters
        const queryParameters: { [key: string]: string } = {};
        if (queryParams) {
            if (queryParams.chain) queryParameters.chain = queryParams.chain;
            if (queryParams.from_block !== undefined) queryParameters.from_block = queryParams.from_block.toString();
            if (queryParams.to_block !== undefined) queryParameters.to_block = queryParams.to_block.toString();
            if (queryParams.from_date) queryParameters.from_date = queryParams.from_date;
            if (queryParams.to_date) queryParams.to_date = queryParams.to_date;
            if (queryParams.cursor) queryParameters.cursor = queryParams.cursor;
            if (queryParams.limit !== undefined) queryParameters.limit = queryParams.limit.toString();
            if (queryParams.disable_total !== undefined) queryParameters.disable_total = queryParams.disable_total.toString();
        }

        // Use relative path - HttpClient will combine with apiBaseUrl
        // apiBaseUrl ends with /, so relative path will be appended correctly
        super(
            context,
            `wallets/${address}/history`,
            HttpMethodEnum.GET,
            {
                headers,
                queryParameters,
            }
        );
    }
}

