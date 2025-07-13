import express from "express";
import { searchPosts } from "../controllers/searchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/posts", authMiddleware, searchPosts);

export default router;