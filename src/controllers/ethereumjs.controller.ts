import { createBlock } from "@ethereumjs/block";
import { Blockchain, createBlockchain } from "@ethereumjs/blockchain";
import { Common, Hardfork, Mainnet } from "@ethereumjs/common";
import { bytesToHex } from "@ethereumjs/util";
import { Request, Response, NextFunction } from "express";

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
            common = new Common({ chain: Mainnet, hardfork: Hardfork.London })
            // Use the safe static constructor which awaits the init method
            blockchain = await createBlockchain({
                validateBlocks: false, // Skipping validation so we can make a simple chain without having to provide complete blocks
                validateConsensus: false,
                common,
            });
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

        const block = createBlock(
            {
                header: {
                    number: 1n,
                    parentHash: blockchain.genesisBlock.hash(),
                    difficulty: blockchain.genesisBlock.header.difficulty + 1n,
                },
            },
            { common, setHardfork: true },
        );

        const blockData: CreateBlockResponse[] = [];

        await blockchain.putBlock(block);
        await blockchain.iterator('i', (block) => {
            const blockNumber = block.header.number.toString()
            const blockHash = bytesToHex(block.hash())
            console.log(`Block ${blockNumber}: ${blockHash}`);

            blockData.push({
                nameOrIndex: blockNumber,
                hash: blockHash,
            });
        });

        res.status(200).json({
            blockData
        });
    } catch (error) {
        console.error("Error creating new blockchain block: ", error);
        return next(error);
    }
};
