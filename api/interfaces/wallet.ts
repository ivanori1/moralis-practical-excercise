/**
 * Moralis Wallet History API Response Interfaces
 * Based on: https://deep-index.moralis.io/api-docs-2.2/#/Wallets/getWalletHistory
 */

export interface WalletHistoryResponse {
    result: Transaction[];
    total?: number;
    page?: number;
    page_size?: number;
    limit?: number;
    cursor?: string | null;
}

export interface Transaction {
    hash: string;
    nonce: string;
    transaction_index: string;
    from_address: string;
    to_address: string | null;
    value: string;
    gas: string;
    gas_price: string;
    input: string;
    receipt_cumulative_gas_used: string;
    receipt_gas_used: string;
    receipt_contract_address: string | null;
    receipt_root: string | null;
    receipt_status: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
    transfers?: Transfer[];
    logs?: Log[];
    decoded_call?: DecodedCall;
    category?: string;
    method?: string;
    method_hash?: string;
    method_name?: string;
}

export interface Transfer {
    block_number: string;
    block_timestamp: string;
    from_address: string;
    to_address: string;
    value: string;
    transaction_hash: string;
    log_index: number;
    token_address?: string;
    token_name?: string;
    token_symbol?: string;
    token_decimals?: string;
    token_logo?: string;
    token_contract_type?: string;
}

export interface Log {
    log_index: number;
    transaction_hash: string;
    address: string;
    data: string;
    topic0: string | null;
    topic1: string | null;
    topic2: string | null;
    topic3: string | null;
}

export interface DecodedCall {
    name: string;
    signature: string;
    params: DecodedParam[];
}

export interface DecodedParam {
    name: string;
    type: string;
    value: string | number | boolean | object;
}

export interface WalletHistoryQueryParams {
    chain?: string;
    from_block?: number;
    to_block?: number;
    from_date?: string;
    to_date?: string;
    cursor?: string;
    limit?: number;
    disable_total?: boolean;
}


