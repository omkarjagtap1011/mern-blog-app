import { Link } from "react-router-dom";
import { RiQuillPenLine } from "react-icons/ri";
import { HiOutlineHeart } from "react-icons/hi2";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <RiQuillPenLine className="footer-logo-icon" />
              <span>BlogVerse</span>
            </Link>
            <p className="footer-tagline">
              A place to read, write, and deepen your understanding of topics that matter to you.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/my-blogs">My Blogs</Link>
            <Link to="/create">Write a Blog</Link>
          </div>

          <div className="footer-links-group">
            <h4>Categories</h4>
            <span>Technology</span>
            <span>Travel</span>
            <span>Lifestyle</span>
            <span>Education</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BlogVerse. All rights reserved.</p>
          <p className="footer-made-with">
            Made with <HiOutlineHeart className="footer-heart" /> by BlogVerse Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
