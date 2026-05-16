import { useState, useEffect } from "react";
import { getAllBlogsAPI } from "../api/api";
import BlogCard from "../components/BlogCard";
import Loader from "../components/Loader";
import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from "react-icons/hi2";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Technology", "Travel", "Food", "Lifestyle", "Education", "Health", "Finance", "Entertainment", "Sports", "Other"];

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const res = await getAllBlogsAPI(params);
      setBlogs(res.data.blogs);
    } catch {
      toast.error("Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleLikeUpdate = (blogId, newLikes, newLikesCount) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog._id === blogId ? { ...blog, likes: newLikes, likesCount: newLikesCount } : blog
      )
    );
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Discover Stories & Ideas</h1>
        <p>Explore articles from writers across the globe on topics you love</p>

        <form className="home-search-bar" onSubmit={handleSearch}>
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs by title or content..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="home-content">
        <div className="home-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <HiOutlineFunnel className="empty-state-icon" />
            <h3>No blogs found</h3>
            <p>Try a different search term or category</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} onLikeUpdate={handleLikeUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
