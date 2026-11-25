import { useState } from "react";
import axios from "axios";
import { API_URL, getError } from "../config";

function Register(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mentee");
  const [interests, setInterests] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post(API_URL + "/auth/register", {
        name: name,
        email: email,
        password: password,
        role: role,
        interests: interests,
      });
      alert("Registration successful! Please login.");
      props.goToLogin();
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="form-box">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>I am a</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="mentee">Mentee</option>
          <option value="mentor">Mentor</option>
        </select>

        <label>STEM interests (separate with commas)</label>
        <input
          type="text"
          placeholder="Example: Biology, Physics"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          required
        />

        <button type="submit">Register</button>
        {error !== "" && <p className="error">{error}</p>}
      </form>
      <p>
        Already have an account?{" "}
        <button className="link-button" onClick={props.goToLogin}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;
