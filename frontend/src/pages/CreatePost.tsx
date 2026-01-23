import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreatePost = () => {
  //state for form input
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  //use navigation after success
  const navigate = useNavigate();
  // runs when form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //prevent page load
    try {
      //call backend API to create post
      await API.post("/posts", {
        title,
        body,
      });
      // after successful creation → go back to posts page
      navigate("/posts");
    } catch (error) {
      alert("Failed to create Post");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-[500px]"
      >
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <input
          className="border p-2 w-full mb-3"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Post body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 w-full">Create</button>
      </form>
    </div>
  );
};

export default CreatePost;
