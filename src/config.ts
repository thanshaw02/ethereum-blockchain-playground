// .env in root of repository

import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    ethLevelDb: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 8000,
    nodeEnv: process.env.NODE_ENV || "development",
    ethLevelDb: process.env.ETH_LEVEL_DB || "ethereumjs-data",
};

export default config;