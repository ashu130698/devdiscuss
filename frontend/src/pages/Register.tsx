import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

type ApiError = {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
};

function getRegisterErrorMessage(error: unknown) {
  const apiError = error as ApiError;

  return (
    apiError.response?.data?.error ||
    apiError.response?.data?.message ||
    apiError.message ||
    "Register failed"
  );
}

const Register = () => {
  //state to store from values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // function call when form submitted
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // calling backend register api
      await API.post("/auth/register", {
        name,
        email,
        password,
      });
      alert("Registration succesful. Please login");

      //after register redirect to login page
      navigate("/login");
    } catch (err: unknown) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <input
          className="border p-2 w-full mb-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
