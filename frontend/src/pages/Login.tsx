import { useState } from "react";
import API from "../services/api";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      // Save token in browser storage
      localStorage.setItem("token", res.data.token);

      alert("Login successful");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="bg-red-500 text-white p-4">
      <h2>Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
