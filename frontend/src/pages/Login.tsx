import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      // Save token in browser storage
      localStorage.setItem("token", res.data.token);

      alert("Login successful");

      navigate("/posts");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="bg-red-500 text-white p-4">
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p className="mt-3 text-center">
        Don't have an account?
        <span
          className="text-blue-500 cursor-pointer ml-1"
          onClick={() => navigate("/register")}
        >
          Register here
        </span>
      </p>
    </div>
  );
};

export default Login;
