Feature: Moralis Wallet History API Testing
  As a QA Engineer
  I want to test the Moralis Wallet History API endpoint
  So that I can validate transaction data accuracy and identify edge cases

  Background:
    Given I have a wallet address "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    And I want to query wallet history for chain "eth"

  @smoke @wallet_history
  Scenario: Get wallet history with default parameters
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain a list of transactions
    And the response body matches "wallet_history_response_schema" schema

  @wallet_history @validation
  Scenario: Validate transaction data structure and format
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain a list of transactions
    And each transaction should have a valid transaction hash
    And each transaction should have valid from and to addresses
    And each transaction should have a valid block hash
    And transactions should be ordered by block number descending

  @wallet_history @data_accuracy
  Scenario: Validate transaction data accuracy - Task 2
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain at least 1 transaction(s)
    And I should store the first transaction for validation
    And the stored transaction should have valid numeric fields
    And the stored transaction block_timestamp should be a valid ISO date
    And the stored transaction gas_used should be less than or equal to gas limit
    And the stored transaction should have consistent block information
    And I should be able to verify the transaction independently using the hash "${context:firstTransaction.hash}"

  @wallet_history @data_accuracy
  Scenario: Validate transaction receipt status
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain at least 1 transaction(s)
    And I should store the first transaction for validation
    And the stored transaction receipt_status should be "1"

