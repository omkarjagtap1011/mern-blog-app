import { useState, useEffect } from "react";
import { getMyBlogsAPI, deleteBlogAPI } from "../api/api";
import BlogCard from "../components/BlogCard";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import toast from "react-hot-toast";

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBlogs = async () => {
    setLoading(true);
    try {
      const res = await getMyBlogsAPI();
      setBlogs(res.data.blogs);
    } catch {
      toast.error("Failed to fetch your blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const handleLikeUpdate = (blogId, newLikes, newLikesCount) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog._id === blogId ? { ...blog, likes: newLikes, likesCount: newLikesCount } : blog
      )
    );
  };

  return (
    <div className="myblogs-page">
      <div className="myblogs-header">
        <div>
          <h1>My Blogs</h1>
          <p>{blogs.length} {blogs.length === 1 ? "article" : "articles"} published</p>
        </div>
        <Link to="/create" className="btn-primary">
          <HiOutlinePencilSquare />
          <span>Write New</span>
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <HiOutlinePencilSquare className="empty-state-icon" />
          <h3>No blogs yet</h3>
          <p>Start writing your first blog post!</p>
          <Link to="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
            Write Your First Blog
          </Link>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onLikeUpdate={handleLikeUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;
