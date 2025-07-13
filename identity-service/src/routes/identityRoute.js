import express from "express";
import { loginUser, registerUser, refreshTokenController, logoutUser } from "../controllers/identityController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutUser);

export default router;
