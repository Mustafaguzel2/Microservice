import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

searchSchema.index({ content: "text" });
searchSchema.index({ createdAt: -1 });
searchSchema.index({ userId: 1 }); // Add index for better query performance

const Search = mongoose.model("Search", searchSchema);
export default Search;
