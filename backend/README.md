# Welcome to LICK Betting DApp - Backend 👋
![Version](https://img.shields.io/badge/version-1.1.0-blue.svg?cacheSeconds=2592000)
![Static Badge](https://img.shields.io/badge/node-v9.8.1-blue)
![Static Badge](https://img.shields.io/badge/npm-v18.17.0-blue)
![Static Badge](https://img.shields.io/badge/Nest-v10.1.11-blue)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/trashpirate/betting-dapp-backend#readme)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/trashpirate/betting-dapp-backend/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/trashpirate/betting-dapp-backend/blob/master/LICENSE)
[![Twitter: N0\_crypto](https://img.shields.io/twitter/follow/N0\_crypto.svg?style=social)](https://twitter.com/N0\_crypto)

> This is the first iteration of a DApp that allows users to place bets on future price movement using an ERC20 token. A betting round is initiated by an administrator in the backend who determines the round end date and the expiration of the betting period. At the beginning of each round the price of a specific token (defined in the backend) is locked and then compared to the price at the end of the round. Users can place bets while the betting period is open which typically ends 1 hour or more before the betting round. 

> The user can connect their wallets which directs them to the correct blockchain. By entering their bet amount and using the buttons "Bet UP" or "Bet Down", tokens are sent to two different wallets that hold the tokens for each bet decision. The wallets are owned and managed by the administrators. At the end of each round, the administrator calculates the payouts based on the bet amounts entered during the betting period and transfers the tokens back to the users. In future versions, this will be automated in the backend or possibly even replaced by a smart contract.

> This repo represents the backend of the LICK Betting DApp and is NestJS API. The API handles the fetching of the token price using the CoinmarketCap API, starting, ending, and managing the betting rounds. It includes a websocket to push the token price to the frontend in a specified interval. With Swagger, the administrator can interact with the NestJS API to manage and view the betting rounds. In the future, this backend will either include a database to provide a more robust way to handle the betting rounds or a smart contract that handles the betting.

> For this application to work you need also to install and run the frontend (NextJS/React): https://github.com/trashpirate/betting-dapp-frontend

### 🏠 [Homepage](https://petlfg.com)

## Setup

- Create .env file
- Copy and paste your CoinmarketCap API key into your env file:

```
COINMARKETCAP_API_KEY=<YourAPIKey>

```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run start
```

## Author

👤 **Nadina Oates**

* Twitter: [@N0\_crypto](https://twitter.com/N0\_crypto)
* Github: [@trashpirate](https://github.com/trashpirate)
* LinkedIn: [@nadinaoates](https://linkedin.com/in/nadinaoates)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/trashpirate/betting-dapp-backend/issues). 

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2023 [Nadina Oates](https://github.com/trashpirate).

This project is [MIT](https://github.com/trashpirate/betting-dapp-backend/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_