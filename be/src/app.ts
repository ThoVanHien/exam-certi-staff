import cors from "cors";
import express from "express";
import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "ECEP backend is healthy"
  });
});

app.use("/api", apiRouter);
app.use(errorHandler);

export { app };
