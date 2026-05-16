import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBlogByIdAPI, deleteBlogAPI, toggleLikeAPI, addCommentAPI, deleteCommentAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { HiOutlineHeart, HiHeart, HiOutlineChatBubbleLeft, HiOutlinePencilSquare, HiOutlineTrash, HiArrowLeft, HiOutlinePaperAirplane } from "react-icons/hi2";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBlog = async () => {
    try {
      const res = await getBlogByIdAPI(id);
      setBlog(res.data.blog);
      setComments(res.data.comments);
    } catch {
      toast.error("Failed to load blog.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlog(); }, [id]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleLikeAPI(id);
      setBlog((prev) => ({ ...prev, likes: res.data.likes, likesCount: res.data.likesCount }));
    } catch { toast.error("Failed to update like."); }
    finally { setLikeLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    setDeleteLoading(true);
    try {
      await deleteBlogAPI(id);
      toast.success("Blog deleted successfully!");
      navigate("/my-blogs");
    } catch { toast.error("Failed to delete blog."); }
    finally { setDeleteLoading(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) { toast.error("Comment cannot be empty."); return; }
    setCommentLoading(true);
    try {
      const res = await addCommentAPI({ blogId: id, text: commentText });
      setComments((prev) => [res.data.comment, ...prev]);
      setBlog((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      setCommentText("");
      toast.success("Comment added!");
    } catch { toast.error("Failed to add comment."); }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteCommentAPI(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setBlog((prev) => ({ ...prev, commentsCount: Math.max((prev.commentsCount || 1) - 1, 0) }));
      toast.success("Comment deleted!");
    } catch { toast.error("Failed to delete comment."); }
  };

  const isLiked = blog?.likes?.includes(user?._id);
  const isAuthor = blog?.author?._id === user?._id;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formatCommentDate = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateStr);
  };

  if (loading) return <Loader />;
  if (!blog) return null;

  return (
    <div className="blog-detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}><HiArrowLeft /> Back</button>

      <article className="blog-detail-article">
        <div className="blog-detail-header">
          <span className="blog-detail-category">{blog.category}</span>
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <div className="blog-detail-author">
              <div className="blog-detail-avatar">{blog.author?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <span className="blog-detail-author-name">{blog.author?.name}</span>
                <span className="blog-detail-date">{formatDate(blog.createdAt)}</span>
              </div>
            </div>
            {isAuthor && (
              <div className="blog-detail-owner-actions">
                <Link to={`/edit/${blog._id}`} className="btn-icon-edit" title="Edit"><HiOutlinePencilSquare /></Link>
                <button onClick={handleDelete} className="btn-icon-delete" title="Delete" disabled={deleteLoading}><HiOutlineTrash /></button>
              </div>
            )}
          </div>
        </div>

        <div className="blog-detail-content">
          {blog.content.split("\n").map((para, i) => (para.trim() ? <p key={i}>{para}</p> : <br key={i} />))}
        </div>

        <div className="blog-detail-engagement">
          <button className={`blog-detail-like-btn ${isLiked ? "liked" : ""}`} onClick={handleLike} disabled={likeLoading}>
            {isLiked ? <HiHeart /> : <HiOutlineHeart />}
            <span>{blog.likesCount || 0} {blog.likesCount === 1 ? "Like" : "Likes"}</span>
          </button>
          <div className="blog-detail-comment-count">
            <HiOutlineChatBubbleLeft />
            <span>{blog.commentsCount || 0} {blog.commentsCount === 1 ? "Comment" : "Comments"}</span>
          </div>
        </div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        <form onSubmit={handleAddComment} className="comment-form">
          <div className="comment-form-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="comment-form-input-wrapper">
            <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit" disabled={commentLoading || !commentText.trim()}>
              <HiOutlinePaperAirplane />
            </button>
          </div>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-avatar">{comment.userId?.name?.charAt(0).toUpperCase()}</div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{comment.userId?.name}</span>
                    <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
                {comment.userId?._id === user._id && (
                  <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment._id)} title="Delete comment"><HiOutlineTrash /></button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
