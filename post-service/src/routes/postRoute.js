import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
} from "../controllers/postController.js";
import authenticateRequest from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-post", authenticateRequest, createPost);
router.get("/get-all-posts", getAllPosts);
router.get("/get-post/:id", authenticateRequest, getPostById);
router.delete("/delete-post/:id", authenticateRequest, deletePost);

export default router;
