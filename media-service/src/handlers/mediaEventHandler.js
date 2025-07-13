import { logger } from "../utils/logger.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import Media from "../models/Media.js";

const handlePostDeletedEvent = async (event) => {
  try {
    const { postId, mediaIds } = event;
    const mediaToDelete = await Media.find({
      _id: { $in: mediaIds },
    });
    /* Aynı kullanıcı aynı fotoğrafı farklı postlarda kullandıysa,
    Public ID'si aynı olacağı için oralardan da silme işlemi yapılır.
    Bu sorun post Id'si publicId'sine eklenerek çözülebilir.
    */
    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(
        `Deleted media: ${media.publicId} associated with post: ${postId}`
      );
    }
    logger.info(
      `Processed ${mediaToDelete.length} media associated with post: ${postId}`
    );
  } catch (error) {
    logger.error("Error handling post deleted event", error);
  }
};

export { handlePostDeletedEvent };
