import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CreatePost = () => {
  //state for form input
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  //use navigation after success
  const navigate = useNavigate();

  // runs when form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //prevent page load
    try {
      //call backend API to create post
      await API.post("/posts", {
        title,
        body, // Fixed: was content
      });
      // after successful creation → go back to posts page
      navigate("/posts");
    } catch {
      alert("Failed to create Post");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        
        <div className="flex border-b mb-4">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 ${!isPreview ? "border-b-2 border-blue-500 font-bold" : ""}`}
          >
            Write
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 ${isPreview ? "border-b-2 border-blue-500 font-bold" : ""}`}
          >
            Preview
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isPreview ? (
            <>
              <input
                className="border p-2 w-full mb-3 rounded"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="border p-2 w-full mb-3 rounded"
                placeholder="Post body (Markdown supported)"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{title || "Untitled Post"}</h1>
              <div className="prose max-w-none border p-4 rounded bg-gray-50 min-h-[300px]">
                {body ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            </div>
          )}
          <button className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition-colors">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
