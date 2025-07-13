import { logger } from "../utils/logger.js";
import Post from "../models/Post.js";
import validatePost from "../utils/validation.js";
import { publishEvent } from "../utils/rabbitmq.js";

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

// Create a post
export const createPost = async (req, res) => {
  logger.info(`Creating post for user: ${req.user.userId}`);
  try {
    const { content, mediaIds } = req.body;
    const { error } = validatePost(content, mediaIds);
    if (error) {
      logger.warn(`Invalid post data: ${error.message}`);
      return res.status(400).json({
        error: error.message,
        success: false,
        message: "Invalid post data",
      });
    }
    const newPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await newPost.save();

    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: newPost.user.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });

    await invalidatePostCache(req, newPost._id.toString());

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost._id,
    });
    logger.info(`Post created successfully: ${newPost._id}`);
  } catch (error) {
    logger.warn(`Error creating post: ${error.message}`);
    res.status(500).json({
      error: "Failed to create post",
      success: false,
      message: error.message,
    });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  logger.info(`Getting all post endpoint called`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);
    if (cachedPosts) {
      logger.info(`Serving cached posts for page ${page}`);
      return res.json(JSON.parse(cachedPosts));
    }
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalNumberOfPosts = await Post.countDocuments();
    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNumberOfPosts / limit),
      totalPosts: totalNumberOfPosts,
    };
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    logger.warn(`Error getting posts: ${error.message}`);
    res.status(500).json({
      error: "Failed to get posts",
      success: false,
      message: error.message,
    });
  }
};

// Get a post by id
export const getPostById = async (req, res) => {
  logger.info(`Getting post by id: ${req.params.id}`);
  try {
    const postId = req.params.id;
    const cachekey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachekey);
    if (cachedPost) {
      logger.info(`Serving cached post for id: ${postId}`);
      return res.json(JSON.parse(cachedPost));
    }
    const post = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post not found for id: ${postId}`);
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await req.redisClient.setex(cachekey, 3600, JSON.stringify(post));
    res.status(200).json(post);
    logger.info(`Post fetched successfully: ${postId}`);
  } catch (error) {
    logger.warn(`Error getting post by id: ${error.message}`);
    res.status(500).json({
      error: "Failed to get post by id",
      success: false,
      message: error.message,
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  logger.info(`Deleting post by id: ${req.params.id}`);
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const post = await Post.findOneAndDelete({
      _id: postId,
      user: userId,
    });
    if (!post) {
      logger.warn(`Post not found for id: ${postId}`);
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: post.user,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(req, postId);
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
    logger.info(`Post deleted successfully: ${postId}`);
  } catch (error) {
    logger.warn(`Error deleting post: ${error.message}`);
    res.status(500).json({
      error: "Failed to delete post",
      success: false,
      message: error.message,
    });
  }
};
