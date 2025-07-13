import Joi from "joi";

const validatePost = (content, mediaIds) => {
  const schema = Joi.object({
    content: Joi.string().required().min(1).max(5000),
    mediaIds: Joi.array().items(Joi.string()).optional(),
  });
  return schema.validate({ content, mediaIds });
};

export default validatePost;
