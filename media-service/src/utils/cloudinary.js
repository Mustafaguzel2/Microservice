import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMediaToCloudinary = async (file, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: `media/${userId}`,
      },
      (error, result) => {
        if (error) {
          logger.error(`Error uploading media to Cloudinary: ${error}`);
          reject(error);
        } else {
          logger.info(`Media uploaded to Cloudinary: ${result.public_id}`);
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Media deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error("Error deleting media from cloudinary", error);
    throw error;
  }
};
