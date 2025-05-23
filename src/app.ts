import express from "express";
import config from "./config";
import router from "./routes";
// import { Level } from "level";

const app = express();
const PORT = config.port;

app.use("/api", router);
app.use(express.json());

// initialize Level database
// const db = new Level<string, string>(config.ethLevelDb);


app.listen(PORT, async () => {
    console.log("===========================================================");
    console.log(`============ Server is listening on port: ${PORT} ============`);
    console.log("===========================================================");
});

export default app;