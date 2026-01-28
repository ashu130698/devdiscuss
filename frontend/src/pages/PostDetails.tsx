import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/useAuth";

type UserRef = {
  _id: string;
  name: string;
};
//structure of post returned by backend
type Post = {
  _id: string;
  title: string;
  body: string;
  author: UserRef;
};
//structure of answer returned by backend
type Answer = {
  _id: string;
  body: string;
  author: UserRef;
};

const PostDetails = () => {
  //gets id from /posts/:id
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [answer, setAnswer] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();

  //fetch single post
useEffect(() => {
  if (!id) return;

  const fetchPost = async () => {
    try {
      const res = await API.get(`/posts/${id}`);
      setPost(res.data);
    } catch {
      setError("Failed to load post");
    }
  };

  const fetchAnswers = async () => {
    try {
      const res = await API.get(`/posts/${id}/answers`);
      setAnswer(res.data);
    } catch {
      setError("Failed to load answer");
    }
  };

  fetchPost();
  fetchAnswers();
}, [id]);


  //add new answers
const handleAnswer = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newAnswer.trim()) return;

  try {
    await API.post(`/posts/${id}/answers`, { body: newAnswer });
    setNewAnswer("");

    const res = await API.get(`/posts/${id}/answers`);
    setAnswer(res.data);
  } catch {
    alert("Failed to add answers");
  }
};

  //Delete handler
  const handleDelete = async (answerId: string) => {
    if (!window.confirm("Delete this answer?")) return;

    try {
      await API.delete(`/answers/${answerId}`);
      setAnswer((prev) => prev.filter((a) => a._id !== answerId));
    } catch {
      alert("Not authorized or failed");
    }
  };

  //show error
  if (error) {
    return <div className="p-4">{error}</div>;
  }
  // Show if post not found
  if (!post) {
    return <div className="p-4 text-red-500">Post not found</div>;
  }
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* back button */}
      <button
        onClick={() => navigate("/posts")}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Posts
      </button>
      {/* Post */}
      <div className="border p-4 mb-6 rounded">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <p className="text-gray-600 mb-2">by {post.author.name}</p>
        <p>{post.body}</p>
      </div>

      {/* Answers */}
      <h3 className="text-xl font-semibold mb-3">Answers ({answer.length})</h3>

      {answer.length === 0 && <p className="text-gray-500">No answers yet</p>}
      {answer.map((a) => (
        <div key={a._id} className="border p-3 mb-3 rounded">
          <p>{a.body}</p>
          <p className="text-sm text-gray-500">by {a.author.name}</p>
          {user && a.author._id === user._id && (
            <button
              onClick={() => handleDelete(a._id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          )}
        </div>
      ))}
      {/* Add answers */}
      {user ? (
        <form onSubmit={handleAnswer} className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Write an Answer</h3>
          <textarea
            className="border p-2 w-full mb-2 rounded"
            placeholder="Write your answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={4}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Answer
          </button>
        </form>
      ) : (
        <p className="mt-6 text-gray-500">Login to write answer</p>
      )}
    </div>
  );
};

export default PostDetails;
