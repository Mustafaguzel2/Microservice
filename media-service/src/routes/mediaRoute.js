import express from "express";
import multer from "multer";
import { getAllMedias, uploadMedia } from "../controllers/mediaController.js";
import authenticateRequest from "../middlewares/authMiddleware.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
}).single("file");

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer error: ${err}`);
        return res.status(400).json({
          message: "Multer error uploading media",
          error: err.message,
          stack: err.stack,
          success: false,
        });
      } else if (err) {
        logger.error(`Unknown error uploading media: ${err}`);
        return res.status(500).json({
          message: "Error uploading media",
          error: err.message,
          stack: err.stack,
          success: false,
        });
      }
      if (!req.file) {
        logger.error("No file uploaded");
        return res.status(400).json({
          message: "No file uploaded, please upload a file",
          success: false,
        });
      }
      next();
    });
  },
  uploadMedia
);

router.get("/get-all", authenticateRequest, getAllMedias);

export default router;
