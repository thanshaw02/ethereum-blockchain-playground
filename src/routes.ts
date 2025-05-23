import { Router, Request, Response } from 'express';

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

export default router;
