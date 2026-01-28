import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); /// clear auth context + storage
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      {/* Left side */}
      <Link to="/posts" className="text-lg font-bold">
        DevDiscuss
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-300">Hi, {user.name}</span>

            <Link
              to="/create-post"
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              Create Post
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
