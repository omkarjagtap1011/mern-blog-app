import express from "express";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/blogs — get all blogs (with author info)
router.get("/", auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    // Get comment counts for each blog
    const blogIds = blogs.map((blog) => blog._id);
    const commentCounts = await Comment.aggregate([
      { $match: { blogId: { $in: blogIds } } },
      { $group: { _id: "$blogId", count: { $sum: 1 } } },
    ]);

    const commentCountMap = {};
    commentCounts.forEach((item) => {
      commentCountMap[item._id.toString()] = item.count;
    });

    const blogsWithCounts = blogs.map((blog) => ({
      ...blog.toObject(),
      likesCount: blog.likes.length,
      commentsCount: commentCountMap[blog._id.toString()] || 0,
    }));

    res.status(200).json({ blogs: blogsWithCounts });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/blogs/my — get logged-in user's blogs
router.get("/my", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.userId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const blogIds = blogs.map((blog) => blog._id);
    const commentCounts = await Comment.aggregate([
      { $match: { blogId: { $in: blogIds } } },
      { $group: { _id: "$blogId", count: { $sum: 1 } } },
    ]);

    const commentCountMap = {};
    commentCounts.forEach((item) => {
      commentCountMap[item._id.toString()] = item.count;
    });

    const blogsWithCounts = blogs.map((blog) => ({
      ...blog.toObject(),
      likesCount: blog.likes.length,
      commentsCount: commentCountMap[blog._id.toString()] || 0,
    }));

    res.status(200).json({ blogs: blogsWithCounts });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// GET /api/blogs/:id — get single blog with comments
router.get("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const comments = await Comment.find({ blogId: blog._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      blog: {
        ...blog.toObject(),
        likesCount: blog.likes.length,
        commentsCount: comments.length,
      },
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// POST /api/blogs — create a blog
router.post("/", auth, async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const blog = new Blog({ title, category, content, author: req.userId });
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate("author", "name email");

    res.status(201).json({
      message: "Blog created successfully.",
      blog: {
        ...populatedBlog.toObject(),
        likesCount: 0,
        commentsCount: 0,
      },
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/blogs/:id — update a blog (only author)
router.put("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own blogs." });
    }

    const { title, category, content } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, category, content },
      { new: true, runValidators: true }
    ).populate("author", "name email");

    const commentsCount = await Comment.countDocuments({ blogId: updatedBlog._id });

    res.status(200).json({
      message: "Blog updated successfully.",
      blog: {
        ...updatedBlog.toObject(),
        likesCount: updatedBlog.likes.length,
        commentsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// DELETE /api/blogs/:id — delete a blog (only author)
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own blogs." });
    }

    // Delete all comments associated with this blog
    await Comment.deleteMany({ blogId: blog._id });
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// PUT /api/blogs/:id/like — toggle like on a blog
router.put("/:id/like", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const index = blog.likes.indexOf(req.userId);
    if (index === -1) {
      blog.likes.push(req.userId);
    } else {
      blog.likes.splice(index, 1);
    }

    await blog.save();

    res.status(200).json({
      message: index === -1 ? "Blog liked." : "Blog unliked.",
      likes: blog.likes,
      likesCount: blog.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;
