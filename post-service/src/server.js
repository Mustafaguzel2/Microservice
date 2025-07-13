import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";
import { RateLimiterRedis } from "rate-limiter-flexible";
import postRoutes from "./routes/postRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error(`Error connecting to MongoDB: ${err.message}`);
  });

//Redis client
const redisClient = new Redis(process.env.REDIS_URL);

//Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  if (Object.keys(req.body).length > 0) {
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

//Apply sensitive rate limiting to sensitive endpoints
app.use("/api/posts/create-post", sensitiveRateLimit);
app.use("/api/posts/delete-post/:id", sensitiveRateLimit);

//Routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

//Error handler
app.use(errorHandler);

//Connect to RabbitMQ
async function startServer() {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}
startServer();

//Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled promise: ${promise}, reason: ${reason}`);
  process.exit(1);
});
