import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogByIdAPI, updateBlogAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { HiOutlineEye, HiOutlinePencilSquare, HiArrowLeft } from "react-icons/hi2";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const CATEGORIES = ["Technology", "Travel", "Food", "Lifestyle", "Education", "Health", "Finance", "Entertainment", "Sports", "Other"];

const EditBlog = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: "", category: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getBlogByIdAPI(id);
        const blog = res.data.blog;
        if (blog.author._id !== user._id) {
          toast.error("You can only edit your own blogs.");
          navigate("/");
          return;
        }
        setFormData({ title: blog.title, category: blog.category, content: blog.content });
      } catch {
        toast.error("Failed to load blog.");
        navigate("/my-blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, user._id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.category || !formData.content) {
      toast.error("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await updateBlogAPI(id, formData);
      toast.success("Blog updated successfully!");
      navigate(`/blog/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update blog.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="create-blog-page">
      <div className="create-blog-top-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back
        </button>
        <div className="create-blog-actions">
          <button type="button" className={`btn-toggle-preview ${isPreview ? "active" : ""}`} onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? <HiOutlinePencilSquare /> : <HiOutlineEye />}
            <span>{isPreview ? "Edit" : "Preview"}</span>
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="blog-preview">
          <div className="blog-preview-header">
            {formData.category && <span className="blog-preview-category">{formData.category}</span>}
            <h1 className="blog-preview-title">{formData.title || "Untitled"}</h1>
            <div className="blog-preview-meta">
              <div className="blog-preview-author">
                <div className="blog-preview-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <span className="blog-preview-author-name">{user.name}</span>
                  <span className="blog-preview-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="blog-preview-content">
            {formData.content.split("\n").map((para, i) => (para.trim() ? <p key={i}>{para}</p> : <br key={i} />))}
          </div>
          <div className="blog-preview-publish">
            <button onClick={handleSubmit} className="btn-publish" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="create-blog-form">
          <div className="form-group">
            <label htmlFor="title">Blog Title</label>
            <input type="text" id="title" name="title" placeholder="Enter an engaging title..." value={formData.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" placeholder="Write your blog content here..." rows="14" value={formData.content} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-publish" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      )}
    </div>
  );
};

export default EditBlog;
