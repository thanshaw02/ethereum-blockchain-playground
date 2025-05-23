import express, { Request, Response } from "express";

const app = express();
const router = express.Router();
const PORT = 8080;

router.get("/ping", (req: Request, res: Response) => {
    console.log("Ping health check made on server");
    res.status(200).send("Healthy");
});

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
    console.log("Base path hit");
    res.send("foo");
});

app.listen(PORT, () => {
    console.log("===========================================================");
    console.log(`============ Server is listening on port: ${PORT} ============`);
    console.log("===========================================================");
});