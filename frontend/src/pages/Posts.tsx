import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

//Define Typescript for post (Shape of data from backend)
type Post = {
  _id: string;
  title: string;
  body: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
};

const Posts = () => {
  //state to store posts list
  const [posts, setPosts] = useState<Post[]>([]);
  //state to show loading status
  const [loading, setLoading] = useState(true);
  // state to show error if api fails
  const [error, setError] = useState("");
  // Navigation hook to go to other pages
  const navigate = useNavigate();

  /// logout using global auth state
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      alert("Not authorized or failed to delete post");
    }
  };

  //useEffect runs when components load
  useEffect(() => {
    setPosts([]);
    fetchPosts();
  }, []);

  //function to call backend apis and get posts
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      //save posts in state
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      setError("failed to load posts");
      setLoading(false);
    }
  };

  // if still loading show this
  if (loading) {
    return <div className="p-4">Loading posts...</div>;
  }

  //if error happens show this
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">All Posts</h2>
      <button
        onClick={() => navigate("/create-post")}
        className="bg-blue-600 text-white px-4 py-2 mb-4 rounded hover:bg-blue-700"
      >
        + Create Post
      </button>

      {/* if no post exist */}
      {posts.length === 0 && <p className="text-gray-500">No posts yet</p>}

      {/* map loops through array and show each post */}
      {posts.map((post) => (
        <div
          key={post._id}
          className="border p-4 mb-3 rounded shadow hover:bg-gray-100 transition"
        >
          {/* Clickable post content */}
          <div
            onClick={() => navigate(`/posts/${post._id}`)}
            className="cursor-pointer"
          >
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-2">by {post.author?.name}</p>
            <p>{post.body}</p>
          </div>

          {/* Delete button (only if user is post author) */}
          {user && post.author._id === user._id && (
            <button
              onClick={() => handleDeletePost(post._id)}
              className="text-red-500 text-sm mt-2 hover:text-red-700"
            >
              Delete Post
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Posts;
