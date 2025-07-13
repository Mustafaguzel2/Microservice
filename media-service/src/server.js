import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mediaRoutes from "./routes/mediaRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import { handlePostDeletedEvent } from "./handlers/mediaEventHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error(`Error connecting to MongoDB: ${err}`);
  });

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// Routes
app.use("/api/media", mediaRoutes);

app.use(errorHandler);

//Connect to RabbitMQ
async function startServer() {
  try {
    await connectRabbitMQ();

    await consumeEvent("post.deleted", handlePostDeletedEvent);

    app.listen(PORT, () => {
      logger.info(`Media service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}
startServer();

//Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled rejection: ${reason}`);
  logger.error(`Promise: ${promise}`);
});
