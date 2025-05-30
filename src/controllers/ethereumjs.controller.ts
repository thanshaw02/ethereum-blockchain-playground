import { createBlock } from "@ethereumjs/block";
import { Blockchain, createBlockchain } from "@ethereumjs/blockchain";
import { Common, createCommonFromGethGenesis, parseGethGenesisState } from "@ethereumjs/common";
import { bytesToHex } from "@ethereumjs/util";
import { Request, Response, NextFunction } from "express";
import { postMergeGethGenesis } from "../utils";
import { createFeeMarket1559Tx } from "@ethereumjs/tx";

// used to copy/past quickly into postman to test the "createEthereumBlock" endpoint
type TestTransactionData = {
    "firstName": "Tylor",
    "lastName": "Hanshaw",
    "age": 29,
    "email": "tylorjhanshaw@xeratec.com",
    "occupation": "Full Stack Developer"
};

type CreateBlockResponse = {
    nameOrIndex: string | number;
    hash: string;
};

let blockchain: Blockchain | undefined = undefined;
let common: Common | undefined = undefined;

export const createEthereumBlockchain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let created = false;
        if (!blockchain && !common) {
            console.log("Creating blockchain!");

            // create a custom "Common" for the blockchain
            common = createCommonFromGethGenesis(postMergeGethGenesis, { chain: "customChain" })

            // initialization of the blockchain
            const genesisState = parseGethGenesisState(postMergeGethGenesis);
            blockchain = await createBlockchain({
                validateBlocks: false,
                validateConsensus: false,
                genesisState, // initialize the genesis block on the blockchain
                common,
            });
            const genesisBlockHash = blockchain.genesisBlock.hash()
            common.setForkHashes(genesisBlockHash);
        } else {
            console.log("Blockchain already exists!");
            created = true;
        }

        res.status(200).json({
            message: created ? "Blockchain already exists" : "Blockchain created",
        });
    } catch (error) {
        console.error("Error creating new blockchain: ", error);
        return next(error);
    }
};

export const createEthereumBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!blockchain) {
            return next("Blockchain does not exist");
        }

        const latestBlock = await blockchain.getCanonicalHeadBlock();
        const tx = createFeeMarket1559Tx({
            // the transaction count for the sender address
            // ensures transactions are processed in order and only once, starts at 0 for each sender
            nonce: "0x00",

            // the tip paid directly to miners, this helps prioritize your transaction during congestion
            maxPriorityFeePerGas: "0x01",

            // the maximum total fee (base fee + priority fee) you're willing to pay per gas unit
            // ensures you won’t overpay if the base fee spikes
            maxFeePerGas: "0xff",

            // this is the max amount of computational time/cost that should be used to mine this block
            gasLimit: "0x5208",

            // the amount of Ethereum to send int he transaction
            // Ethereum is not required, this is only used if sending money/Ethereum
            value: "0x00",

            // this can be:
            //  - wallet address
            //  - smart contract address
            //  - null/undefined/omitted if you are reating a new smart contract
            //  - if using the current value seen below this is a common placeholder address, sent no where
            to: "0x0000000000000000000000000000000000000000",

            // data to store in transaction
            data: Buffer.from(JSON.stringify(req.body), "utf-8"),
        }, { common });
    
        const block = createBlock(
            {
                header: {
                    number: latestBlock.header.number + 1n, // must be greater than the previous block
                    parentHash: latestBlock.hash(), // points to the block prior to this new block
                    timestamp: BigInt(Math.floor(Date.now() / 1000)), // must ft within the "Common" boundaries when creating blockchain
                },
                transactions: [tx],
            },
            { common, setHardfork: true },
        );
        await blockchain.putBlock(block);

        // debugging mainly
        // looping over all blocks in the blockchain
        // note: this will always show one block you haven't created here, that is the "genesis block" created when the blockchain is initialized
        const blockData: CreateBlockResponse[] = [];
        let current = await blockchain.getBlock(0n);
        while (current) {
            try {
                blockData.push({
                    nameOrIndex: current.header.number.toString(),
                    hash: bytesToHex(current.hash()),
                });
                current = await blockchain.getBlock(current.header.number + 1n);
            } catch {
                break;
            }
        }

        res.status(200).json({
            blockData
        });
    } catch (error) {
        console.error("Error creating new blockchain block: ", error);
        return next(error);
    }
};

export const getEthereumBlockByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blockNumber = Number(req.params.number);
        if (isNaN(blockNumber) || blockNumber < 0) {
            return next("Block number given is invalid");
        }

        if (!blockchain) {
            return next("Blockchain does not exist");
        }

        const block = await blockchain.getBlock(blockNumber);

        const transaction = block.transactions[0];
        const buffer = Buffer.from(transaction.data);
        const jsonStr = buffer.toString("utf-8");
        const parsed = JSON.parse(jsonStr);

        res.status(200).json({ transactionData: parsed });
    } catch (error) {
        console.error("Error getting block by number: ", error);
        return next(error);
    }
};

/**
 * Up next:
 *  - Look into "Ethereum Smart Contracts"
 *  - Validating blocks over time
 *  - Using a database instead of in-memory blockchains
 */
