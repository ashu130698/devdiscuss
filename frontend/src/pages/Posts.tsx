import React, { useEffect, useState } from "react";
import API from "../services/api";

//Define Typescript for post (Shape of data from backend)
type Post = {
  _id: string;
  title: string;
  body: string;
  author: {
    name: string;
    email: string;
  };
};
const Posts = () => {
  //state to strore posts list
  const [posts, setPosts] = useState<Post[]>([]);
  //state to show loading status
  const [loading, setLoading] = useState(true);
  // state to show error if api fails
  const [error, setError] = useState("");
  //useEffect runs when components load
  useEffect(() => {
    fetchPosts();
  }, []);
  //function to called backend apis and posts
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
      {/* if no post exit */}
      {posts.length === 0 && <p className="text-gray-500">No posts yet</p>}
      {/* map loops through array and show each post */}
      {posts.map((post) => (
        <div key={post._id} className="border p-4 mb-3 rounded shadow">
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {post.author?.name}</p>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
};

export default Posts;
