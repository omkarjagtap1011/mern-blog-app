import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlineHeart, HiHeart, HiOutlineChatBubbleLeft } from "react-icons/hi2";
import { toggleLikeAPI } from "../api/api";
import { useState } from "react";
import toast from "react-hot-toast";

const BlogCard = ({ blog, onLikeUpdate }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(blog.likes || []);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = likes.includes(user?._id);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleLikeAPI(blog._id);
      setLikes(res.data.likes);
      setLikesCount(res.data.likesCount);
      if (onLikeUpdate) {
        onLikeUpdate(blog._id, res.data.likes, res.data.likesCount);
      }
    } catch {
      toast.error("Failed to update like.");
    } finally {
      setLikeLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Technology: "#6366f1",
      Travel: "#f59e0b",
      Food: "#ef4444",
      Lifestyle: "#ec4899",
      Education: "#3b82f6",
      Health: "#10b981",
      Finance: "#8b5cf6",
      Entertainment: "#f97316",
      Sports: "#14b8a6",
      Other: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <Link to={`/blog/${blog._id}`} className="blog-card">
      <div className="blog-card-header">
        <span
          className="blog-card-category"
          style={{ backgroundColor: getCategoryColor(blog.category) + "18", color: getCategoryColor(blog.category) }}
        >
          {blog.category}
        </span>
        <span className="blog-card-date">{formatDate(blog.createdAt)}</span>
      </div>

      <h3 className="blog-card-title">{blog.title}</h3>
      <p className="blog-card-excerpt">{getExcerpt(blog.content)}</p>

      <div className="blog-card-footer">
        <div className="blog-card-author">
          <div className="blog-card-avatar">
            {blog.author?.name?.charAt(0).toUpperCase()}
          </div>
          <span>{blog.author?.name}</span>
        </div>

        <div className="blog-card-stats">
          <button
            className={`blog-card-like-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            {isLiked ? <HiHeart /> : <HiOutlineHeart />}
            <span>{likesCount}</span>
          </button>
          <div className="blog-card-comment-count">
            <HiOutlineChatBubbleLeft />
            <span>{blog.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
