Feature: Moralis Wallet History API - Edge Cases and Error Handling
  As a QA Engineer
  I want to test edge cases and error scenarios
  So that I can ensure the API handles unusual inputs gracefully

  Background:
    Given I have a wallet address "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    And I want to query wallet history for chain "eth"

  @edge_case @negative
  Scenario: Request with invalid chain parameter
    Given I want to query wallet history for chain "invalid_chain"
    When I request the wallet history
    Then the response should have a "400" in the status code

  @edge_case @negative
  Scenario: Request with negative limit
    Given I want to query wallet history with limit -1
    When I request the wallet history
    Then the response should have a "400" in the status code

  @edge_case @negative
  Scenario: Request with limit exceeding maximum
    Given I want to query wallet history with limit 10000
    When I request the wallet history
    Then the response should have a "400" in the status code
    And the response should contain error message about limit maximum

  @edge_case @negative
  Scenario Outline: Request with invalid block range (from_block > to_block)
    Given I want to query wallet history from block <from_block> to block <to_block>
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should have empty result array with pagination fields

    Examples:
      | from_block | to_block |
      | 18000010   | 18000000 |
      | 20000000   | 10000000 |

  @edge_case @boundary
  Scenario Outline: Request with very large block number
    Given I want to query wallet history from block <from_block> to block <to_block>
    When I request the wallet history
    Then the response should have a "200" in the status code

    Examples:
      | from_block | to_block  |
      | 999999999  | 999999999 |
      | 1000000000 | 1000000000|

  @edge_case @boundary
  Scenario: Request with limit of 1
    Given I want to query wallet history with limit 1
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain at most 1 transaction(s)

  @wallet_history @edge_case
  Scenario: Get wallet history with limit parameter
    Given I want to query wallet history with limit 5
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain at least 1 transaction(s)
    And the response should contain at most 5 transaction(s)

  @wallet_history @edge_case
  Scenario: Get wallet history for empty wallet address
    When I request the wallet history for address "0x0000000000000000000000000000000000000000"
    Then the response should have a "400" in the status code
    And the response should contain error message about large amount of data

  @wallet_history @edge_case
  Scenario: Get wallet history for single block with empty result
    Given I want to query wallet history from block 18000010 to block 18000010
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should have empty result array with pagination fields

  @wallet_history @edge_case
  Scenario Outline: Get wallet history with block range filter
    Given I want to query wallet history from block <from_block> to block <to_block>
    When I request the wallet history
    Then the response should have a "200" in the status code
    And the response should contain a list of transactions
    And all transactions should be within the specified block range

    Examples:
      | from_block | to_block  |
      | 18000000   | 18000010  |
      | 18000000   | 18000050  |
      | 17000000   | 17000010  |

  @wallet_history @edge_case
  Scenario: Get wallet history with invalid address format
    When I request the wallet history for address "invalid-address"
    Then the response should have a "400" in the status code

