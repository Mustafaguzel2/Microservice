import { logger } from "../utils/logger.js";
import { validateLogin, validateRegister } from "../utils/validation.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import RefreshToken from "../models/RefreshToken.js";

//Register user
const registerUser = async (req, res) => {
  logger.info("Registration user request received");
  try {
    // Validate request body
    const { error } = validateRegister(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // Check if user already exists
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      logger.warn(
        `User already exists with email: ${email} or username: ${username}`
      );
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = await User.create({ username, email, password });
    logger.info(`User registered successfully with ID: ${user._id}`);

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user._id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Register user error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//login user
const loginUser = async (req, res) => {
  logger.info("Login user request received");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // user valid password or not
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateToken(user);

    res.json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      user: user._id,
    });
    logger.info(`User logged in successfully with ID: ${user._id}`);
  } catch (error) {
    logger.error("Login error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//refresh token
const refreshTokenController = async (req, res) => {
  logger.info("Refresh token request received");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is required");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < Date.now()) {
      logger.warn("Invalid refresh token");
      return res
        .status(400)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    //delete old refresh token first
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new tokens (this will create and save the new refresh token)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    logger.info(`Token refreshed successfully for user: ${user._id}`);
    res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout user
const logoutUser = async (req, res) => {
  logger.info("Logout user request received");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is required");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }
    //delete refresh token
    const storedToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

    if (!storedToken) {
      logger.warn("Invalid refresh token");
      return res
        .status(400)
        .json({ success: false, message: "Invalid refresh token" });
    }

    logger.info(`Refresh token deleted successfully: ${storedToken.token}`);

    res.json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    logger.error("Logout user error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export { registerUser, loginUser, refreshTokenController, logoutUser };
