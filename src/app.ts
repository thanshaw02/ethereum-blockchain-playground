import express from "express";
import config from "./config";
import router from "./routes";

const app = express();
const PORT = config.port;

app.use("/api", router);
app.use(express.json());

app.listen(PORT, () => {
    console.log("===========================================================");
    console.log(`============ Server is listening on port: ${PORT} ============`);
    console.log("===========================================================");
});

export default app;