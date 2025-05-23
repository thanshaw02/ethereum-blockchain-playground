// import { Level } from "level";
// import config from "./config";
import { Blockchain, createBlockchain } from '@ethereumjs/blockchain';
import { Common, Hardfork, Mainnet } from "@ethereumjs/common";

// not needed anymore i think due ot internal Level-esque DB used by ethereumjs
// const db = new Level<string, string>(config.ethLevelDb);

type EthereumBlockchainInit = {
    common: Common,
    blockchain: Blockchain,
};

const ethereumBockchain = async (): Promise<EthereumBlockchainInit> => {
    const common = new Common({ chain: Mainnet, hardfork: Hardfork.London })
    // Use the safe static constructor which awaits the init method
    const blockchain = await createBlockchain({
        validateBlocks: false, // Skipping validation so we can make a simple chain without having to provide complete blocks
        validateConsensus: false,
        common,
    });
    return { blockchain, common };
};

export default ethereumBockchain;
