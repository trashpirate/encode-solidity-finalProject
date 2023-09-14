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

### Issues:
- need to reenter bet amount after approving
- starting round occurs separately in backend and on chain
- claim reward should appear when round closed
- claim button is not working yet
- backend needs work to integrate smart contract interaction
- adding admin panel functionality
- Transaction Hash Visualizer is currently backend-only, and error handling can be improved.

## Transaction Hash Visualizer
### Feature Description
As a gamification and psychic incentive for user participation, the Transaction Hash Visualizer displays a new animal picture every time any user interacts with the betting contract. This is implemented in the backend, but not currently the frontend.

### Concept of Operations
The endpoint interface looks like:
```
curl http://localhost:3001/get-txnhash-visualizer
==> 'https://{hostname:9000/path}/dogs/dog.1474.jpg'
```
That is, a `GET` request to the endpoint returns the URL of the dog image representing the most recent contract interaction (by any user).

In more detail:
1. Frontend or CLI client performs a `GET` request on `/get-txnhash-visualizer`.
2. Backend performs an Etherscan RPC call of the form
`https://api-sepolia.etherscan.io/api?module=account&action=txlist&sort=desc...` to get metadata for the most recent contract interaction.
3. Backend maps the transaction hash to a dog image (there are at least 4000  images in the collection).
4. Backend endpoint returns a response in the form of a URI to the dog image.

### Special Setup
`TXNHASH_VISUALIZER_PREFIX` and `ETHERSCAN_API_KEY` must be correctly defined in `.env.local` where they can be found by the backend server instance. `TNXHASH_VISUALIZER_PREFIX` is a URI prefix to a path containing the animal pictures to use. In this case, the animal pictures are from [https://www.kaggle.com/datasets/chetankv/dogs-cats-images](https://www.kaggle.com/datasets/chetankv/dogs-cats-images).
