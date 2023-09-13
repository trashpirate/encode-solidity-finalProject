# Betting DApp
This is the second iteration of a DApp that allows users to place bets on future price movement using a token price. A betting round is initiated by an administrator in the backend who determines the round end date and the expiration of the betting period. At the beginning of each round the price of a specific token is locked and then compared to the price at the end of the round. Users can place bets while the betting period is open which ends efore the betting round. 

1. Betting round is opened by the administrator (owner of Betting Contract) providing a lock and end time for the new round. The contract then fetches the current price using a ChainLink oracle which is then saved as the locked price.
2. Players can place bets using an ERC20 token to either up or down as os long as the round is open. They can bet as many times as they want.
3. LockTime expires and no bets are accepted anymore
4. CloseTime expires and admin can close the round. Betting Contract fetches the current price of the token and determines the winner based on the lockedPrice recorded previously and distributes the funds for reward claims.
5. Players can claim their win if eligible.

## Token Contract
https://sepolia.etherscan.io/address/0xa84517F6E1448B7d6Cb50c8Af1579F8bEB6092C7

## Betting Contract
https://sepolia.etherscan.io/address/0xAed298e5d34a32cf6510fB14b2fedBf8575536fe


## Issues:
- need to reenter bet amount after approving
- starting round occurs separately in backend and on chain
- claim reward should appear when round closed
- claim button is not working yet
- backend needs work to integrate smart contract interaction
- adding admin panel functionality