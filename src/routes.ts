import { Router, Request, Response } from "express";
import {
    createEthereumBlock,
    createEthereumBlockchain,
} from "./controllers/ethereumjs.controller";

const router = Router();

// Base routes
router.get("/", (req: Request, res: Response) => {
    console.log("Base path hit");
    res.send("foo");
});
router.get("/ping", (req: Request, res: Response) => {
    console.log("Ping health check made on server");
    res.status(200).send("Healthy");
});

// Ethereumjs routes
router.get("/blockchain", createEthereumBlockchain);
router.post("/block", createEthereumBlock);


export default router;
