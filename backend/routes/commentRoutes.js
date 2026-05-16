import express from "express";
import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/comments — add a comment
router.post("/", auth, async (req, res) => {
  try {
    const { blogId, text } = req.body;

    if (!blogId || !text) {
      return res.status(400).json({ message: "Blog ID and comment text are required." });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const comment = new Comment({ blogId, userId: req.userId, text });
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate("userId", "name email");

    res.status(201).json({
      message: "Comment added successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// DELETE /api/comments/:id — delete a comment (only comment owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own comments." });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;
