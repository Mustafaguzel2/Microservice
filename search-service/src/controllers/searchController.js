import { logger } from "../utils/logger.js";
import Search from "../models/Search.js";

const searchPosts = async (req, res) => {
  logger.info("Searching posts");
  try {
    const { query } = req.query;
    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    logger.info(`Found ${results.length} posts for query: ${query}`);
    res.json({
      success: true,
      message: "Posts searched successfully",
      data: results,
    });
  } catch (error) {
    logger.error("Error searching posts", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export { searchPosts };
