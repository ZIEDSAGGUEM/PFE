// models/Story.js

const mongoose = require("mongoose");
const Comment = require("./Comment");

const storySchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  membersLiked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  verify: {
    type: Boolean,
    default: false,
    required: true,
  },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  comments: [Comment.schema],
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
