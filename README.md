# Ethereum Blockchain Playground

This repository is a discovery project for professional work in the future, I will be testing the implementation of a Node based blockchain using several different Node based packages, libraries, etc. to learn more about the usage of blockchains outside of theory.

## Packages/Libraries

1. @ethereumjs/blockchain
    - https://www.npmjs.com/package/@ethereumjs/blockchain
    - https://www.npmjs.com/package/@ethereumjs/block

## How to Run

1. Run `npm install`
2. Run `npm run dev`
3. Use _Postman_ (or other similar tools) to:
    - Create a new **blockchain**: GET `http://localhost:8000/api/blockchain`
    - Add a new **block** to the blockchain: POST `http://localhost:8000/api/block`
        - POST body data can be any JSON you'd liek to test with
    - Fetch transaction data added to a block by **block number**: GET `http://localhost:8000/api/block/:number`

## Note

Currently the blockchain is stored in-memory and is lost when nodemon restarts, I plan to integrate `Level` at some point into the project so the blockchain is more persistant.
