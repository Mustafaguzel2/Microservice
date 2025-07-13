import Search from "../models/Search.js";
import { logger } from "../utils/logger.js";

export const handlePostCreatedEvent = async (event) => {
  try {
    const { postId, userId, content, createdAt } = event;
    const newSearch = new Search({
      postId,
      userId,
      content,
      createdAt,
    });
    await newSearch.save();
    logger.info(`Search created for post ${postId}, ${newSearch._id}`);
  } catch (error) {
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      logger.warn(`Duplicate key error - document already exists`, {
        postId: event.postId,
        userId: event.userId,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
      });
      return; // Don't log as error, just skip
    }

    // Log other errors normally
    logger.error("Error handling post created event", error);
  }
};

export const handlePostDeletedEvent = async (event) => {
  try {
    const { postId } = event;
    await Search.deleteOne({ postId });
    logger.info(`Search deleted for post ${postId}`);
  } catch (error) {
    logger.error("Error handling post deleted event", error);
  }
};
