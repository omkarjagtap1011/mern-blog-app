import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlogAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { HiOutlineEye, HiOutlinePencilSquare, HiArrowLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

const CATEGORIES = ["Technology", "Travel", "Food", "Lifestyle", "Education", "Health", "Finance", "Entertainment", "Sports", "Other"];

const CreateBlog = () => {
  const [formData, setFormData] = useState({ title: "", category: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.content) {
      toast.error("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await createBlogAPI(formData);
      toast.success("Blog published successfully!");
      navigate("/my-blogs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="create-blog-page">
      <div className="create-blog-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back
        </button>
        <div className="create-blog-actions">
          <button
            type="button"
            className={`btn-toggle-preview ${isPreview ? "active" : ""}`}
            onClick={() => setIsPreview(!isPreview)}
            disabled={!formData.title && !formData.content}
          >
            {isPreview ? <HiOutlinePencilSquare /> : <HiOutlineEye />}
            <span>{isPreview ? "Edit" : "Preview"}</span>
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="blog-preview">
          <div className="blog-preview-header">
            {formData.category && (
              <span className="blog-preview-category">{formData.category}</span>
            )}
            <h1 className="blog-preview-title">{formData.title || "Untitled"}</h1>
            <div className="blog-preview-meta">
              <div className="blog-preview-author">
                <div className="blog-preview-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="blog-preview-author-name">{user.name}</span>
                  <span className="blog-preview-date">{formatDate()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="blog-preview-content">
            {formData.content.split("\n").map((para, i) => (
              para.trim() ? <p key={i}>{para}</p> : <br key={i} />
            ))}
          </div>
          <div className="blog-preview-publish">
            <button onClick={handleSubmit} className="btn-publish" disabled={loading}>
              {loading ? "Publishing..." : "Publish Now"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="create-blog-form">
          <div className="form-group">
            <label htmlFor="title">Blog Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter an engaging title..."
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="Write your blog content here..."
              rows="14"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-publish" disabled={loading}>
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateBlog;
