import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlinePencilSquare, HiOutlineUser, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { RiQuillPenLine } from "react-icons/ri";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <RiQuillPenLine className="navbar-logo-icon" />
          <span>BlogVerse</span>
        </Link>

        {user && (
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
            <Link to="/my-blogs" className={`navbar-link ${isActive("/my-blogs") ? "active" : ""}`}>
              My Blogs
            </Link>
            <Link to="/create" className="navbar-btn-create">
              <HiOutlinePencilSquare />
              <span>Write</span>
            </Link>
            <div className="navbar-user-section">
              <div className="navbar-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">{user.name}</span>
              <button onClick={handleLogout} className="navbar-btn-logout" title="Logout">
                <HiOutlineArrowRightOnRectangle />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
