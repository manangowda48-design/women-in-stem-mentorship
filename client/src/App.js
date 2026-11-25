import { useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MenteeDashboard from "./pages/MenteeDashboard";
import MentorDashboard from "./pages/MentorDashboard";

function App() {
  // Read the saved user (if the person logged in before)
  const savedUser = localStorage.getItem("user");

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [page, setPage] = useState("login"); // "login" or "register"

  function handleLogin(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  }

  // Not logged in: show an intro panel and the login or register form
  if (user === null) {
    return (
      <div>
        <Navbar user={null} />
        <div className="auth-page">
          <div className="auth-intro">
            <h1>Find a mentor who has done what you want to do.</h1>
            <p>Match by STEM interest, meet on your schedule, and track how far you have come.</p>
            <ol className="steps">
              <li>Register as a mentor or mentee</li>
              <li>Mentees find a match and send a request</li>
              <li>Mentors accept and sessions are scheduled</li>
              <li>Mark attendance and share feedback</li>
            </ol>
          </div>
          <div className="auth-form">
            {page === "login" ? (
              <Login onLogin={handleLogin} goToRegister={() => setPage("register")} />
            ) : (
              <Register goToLogin={() => setPage("login")} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Logged in: show the dashboard that matches the role
  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      {user.role === "mentor" ? <MentorDashboard user={user} /> : <MenteeDashboard user={user} />}
    </div>
  );
}

export default App;
