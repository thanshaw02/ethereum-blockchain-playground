import { createBlock } from "@ethereumjs/block";
import { Blockchain, createBlockchain } from "@ethereumjs/blockchain";
import { Common, createCommonFromGethGenesis, parseGethGenesisState } from "@ethereumjs/common";
import { bytesToHex } from "@ethereumjs/util";
import { Request, Response, NextFunction } from "express";
import { postMergeGethGenesis } from "../utils";

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

            // create the commonf or the blockchain
            common = createCommonFromGethGenesis(postMergeGethGenesis, { chain: "customChain" })

            // Use the safe static constructor which awaits the init method;
            const genesisState = parseGethGenesisState(postMergeGethGenesis);
            blockchain = await createBlockchain({
                validateBlocks: false,
                validateConsensus: false,
                genesisState,
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
        const block = createBlock(
            {
                header: {
                    number: latestBlock.header.number + 1n,
                    parentHash: latestBlock.hash(),
                    timestamp: BigInt(Math.floor(Date.now() / 1000)),
                },
            },
            { common, setHardfork: true },
        );

        const blockData: CreateBlockResponse[] = [];

        await blockchain.putBlock(block);

        // looping over all blocks in the blockchain
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
