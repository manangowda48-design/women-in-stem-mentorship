import { useState } from "react";
import axios from "axios";
import { API_URL, getError } from "../config";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL + "/auth/login", {
        email: email,
        password: password,
      });
      // App.js will open the correct dashboard based on the role
      props.onLogin(response.data);
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="form-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
        {error !== "" && <p className="error">{error}</p>}
      </form>
      <p>
        New here?{" "}
        <button className="link-button" onClick={props.goToRegister}>
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;
