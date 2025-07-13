import { logger } from "../utils/logger.js";
import Media from "../models/Media.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";

// Upload media to the database
export const uploadMedia = async (req, res) => {
  logger.info("Uploading media service started");
  try {
    const file = req.file;
    if (!file) {
      logger.error("No file uploaded, please upload a file");
      return res
        .status(400)
        .json({ message: "No file uploaded, please upload a file" });
    }
    const { originalname, mimetype, buffer } = file;
    const userId = req.user.userId;

    logger.info(
      `File details; originalname: ${originalname}, mimeType: ${mimetype}, buffer length: ${buffer?.length}`
    );
    logger.info(`Uploding to cloudinary`);

    const cloudinaryResponse = await uploadMediaToCloudinary(file, userId);
    logger.info(
      `Cloudinary response: ${cloudinaryResponse} Public id: ${cloudinaryResponse.public_id}`
    );

    const newMedia = await Media.create({
      publicId: cloudinaryResponse.public_id,
      originalName: originalname,
      mimeType: mimetype,
      userId: userId,
      url: cloudinaryResponse.secure_url,
    });

    await newMedia.save();

    logger.info(`Media created: ${newMedia}`);
    res.status(200).json({
      message: "Media uploaded successfully",
      success: true,
      mediaId: newMedia._id,
      url: newMedia.url,
    });
  } catch (error) {
    logger.error(`Error uploading media: ${error}`);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllMedias = async (req, res) => {
  try {
    const medias = await Media.find();
    res.status(200).json({ medias });
  } catch (error) {
    logger.error(`Error getting all medias: ${error}`);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};