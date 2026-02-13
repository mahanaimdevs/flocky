import cors from "cors";
import express from "express";

import smallGroupsRouter from "./routes/small-groups.js";

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/small-groups", smallGroupsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
