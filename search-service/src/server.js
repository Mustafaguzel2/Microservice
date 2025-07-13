import express from "express";
import cors from "cors";
import helmet from "helmet";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "./utils/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import searchRoutes from "./routes/searchRoute.js";
import {
  handlePostCreatedEvent,
  handlePostDeletedEvent,
} from "./handlers/searchEventHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const redisClient = new Redis(process.env.REDIS_URL);

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

//DDOS protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  try {
    rateLimiter
      .consume(req.ip)
      .then(() => next())
      .catch(() => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          message: "Too many requests",
          success: false,
        });
      });
  } catch (error) {
    logger.error("Rate limit error", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

//Ip based rate limiting for sensitive endpoints
const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: "Too many requests",
      success: false,
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//Apply sensitive rate limiting to search endpoint
app.use("/api/search", sensitiveRateLimit);

//Routes
app.use("/api/search", searchRoutes);

//Error handler
app.use(errorHandler);

//Connect to RabbitMQ
async function startServer() {
  try {
    await connectRabbitMQ();
    await consumeEvent("post.created", handlePostCreatedEvent);
    await consumeEvent("post.deleted", handlePostDeletedEvent);
    app.listen(PORT, () => {
      logger.info(`Search service is running on port ${PORT}`);
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
