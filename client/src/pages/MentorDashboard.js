import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, getError, formatDate, showStars } from "../config";
import ProfileForm from "../components/ProfileForm";
import SessionForm from "../components/SessionForm";
import SessionTable from "../components/SessionTable";

function MentorDashboard(props) {
  const user = props.user;

  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [message, setMessage] = useState("");

  // Loads the latest data from the server
  async function loadData() {
    try {
      const requestResponse = await axios.get(API_URL + "/requests/mentor/" + user._id);
      const sessionResponse = await axios.get(API_URL + "/sessions/user/" + user._id);
      const feedbackResponse = await axios.get(API_URL + "/feedback/mentor/" + user._id);

      setRequests(requestResponse.data);
      setSessions(sessionResponse.data);
      setFeedbackList(feedbackResponse.data);
    } catch (error) {
      setMessage(getError(error));
    }
  }

  // Load data when the page opens
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Actions -----
  async function respondToRequest(requestId, status) {
    try {
      await axios.put(API_URL + "/requests/" + requestId, { status: status });
      setMessage("Request " + status + ".");
      loadData();
    } catch (error) {
      setMessage(getError(error));
    }
  }

  async function scheduleSession(data) {
    try {
      await axios.post(API_URL + "/sessions", {
        mentorId: user._id,
        menteeId: data.otherId,
        date: data.date,
        time: data.time,
        description: data.description,
      });
      setMessage("Session scheduled!");
      loadData();
      return true;
    } catch (error) {
      setMessage(getError(error));
      return false;
    }
  }

  // ----- Helper calculations -----
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted" && r.menteeId);

  const acceptedMentees = [];
  for (let i = 0; i < acceptedRequests.length; i++) {
    acceptedMentees.push({ id: acceptedRequests[i].menteeId._id, name: acceptedRequests[i].menteeId.name });
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const cancelledSessions = sessions.filter((s) => s.status === "cancelled");

  let attendedCount = 0;
  let missedCount = 0;
  for (let i = 0; i < completedSessions.length; i++) {
    if (completedSessions[i].attendance === "attended") {
      attendedCount = attendedCount + 1;
    }
    if (completedSessions[i].attendance === "missed") {
      missedCount = missedCount + 1;
    }
  }

  let ratingTotal = 0;
  for (let i = 0; i < feedbackList.length; i++) {
    ratingTotal = ratingTotal + feedbackList[i].rating;
  }
  const averageRating = feedbackList.length > 0 ? (ratingTotal / feedbackList.length).toFixed(1) : "-";

  // Counts the completed sessions with one mentee
  function countCompleted(menteeId) {
    let count = 0;
    for (let i = 0; i < completedSessions.length; i++) {
      if (completedSessions[i].menteeId && completedSessions[i].menteeId._id === menteeId) {
        count = count + 1;
      }
    }
    return count;
  }

  return (
    <div>
      <div className="page-head">
        <div className="container">
          <div className="top-row">
            <div>
              <h2>Hi, {user.name.split(" ")[0]}</h2>
              <p>Respond to requests, run your sessions and read feedback.</p>
            </div>
            <button className="small-button outline-button" onClick={loadData}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <nav className="jump-nav">
        <div className="container">
          <a href="#profile">Profile</a>
          <a href="#requests">Requests</a>
          <a href="#mentees">Mentees</a>
          <a href="#sessions">Sessions</a>
          <a href="#feedback">Feedback</a>
        </div>
      </nav>

      <div className="container">

      {message !== "" && <p className="notice">{message}</p>}

      {/* Summary */}
      <div className="section">
        <h3>Summary</h3>
        <div className="stats">
          <div className="stat-box">
            <strong>{acceptedMentees.length}</strong>
            <span>Accepted mentees</span>
          </div>
          <div className="stat-box">
            <strong>{completedSessions.length}</strong>
            <span>Sessions completed</span>
          </div>
          <div className="stat-box">
            <strong>{attendedCount}</strong>
            <span>Attended</span>
          </div>
          <div className="stat-box">
            <strong>{missedCount}</strong>
            <span>Missed</span>
          </div>
          <div className="stat-box">
            <strong>{averageRating}</strong>
            <span>Average rating</span>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="section" id="profile">
        <h3>My Mentor Profile</h3>
        <ProfileForm user={user} />
      </div>

      {/* Requests */}
      <div className="section" id="requests">
        <h3>Mentorship Requests</h3>
        {requests.length === 0 ? (
          <p className="empty">No requests yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mentee</th>
                  <th>Interests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.menteeId ? request.menteeId.name : "Unknown"}</td>
                    <td>{request.menteeId ? request.menteeId.interests.join(", ") : ""}</td>
                    <td>
                      <span className={"badge " + request.status}>{request.status}</span>
                    </td>
                    <td>
                      {request.status === "pending" && (
                        <div>
                          <button
                            className="small-button green-button"
                            onClick={() => respondToRequest(request._id, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="small-button red-button"
                            onClick={() => respondToRequest(request._id, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pendingRequests.length > 0 && <p>You have {pendingRequests.length} pending request(s).</p>}
      </div>

      {/* Accepted mentees */}
      <div className="section" id="mentees">
        <h3>My Mentees</h3>
        {acceptedRequests.length === 0 ? (
          <p className="empty">No accepted mentees yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Interests</th>
                  <th>Sessions completed</th>
                </tr>
              </thead>
              <tbody>
                {acceptedRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.menteeId.name}</td>
                    <td>{request.menteeId.email}</td>
                    <td>{request.menteeId.interests.join(", ")}</td>
                    <td>{countCompleted(request.menteeId._id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="section">
        <h3>Schedule a Session</h3>
        {acceptedMentees.length === 0 ? (
          <p className="empty">Accept a mentee's request first to schedule sessions.</p>
        ) : (
          <SessionForm people={acceptedMentees} buttonText="Schedule Session" onSave={scheduleSession} />
        )}
      </div>

      {/* Sessions */}
      <div className="section" id="sessions">
        <h3>Upcoming Sessions</h3>
        <SessionTable
          sessions={upcomingSessions}
          role="mentor"
          onChanged={loadData}
          emptyText="No upcoming sessions."
        />
      </div>

      <div className="section">
        <h3>Completed Sessions (Attendance)</h3>
        <SessionTable
          sessions={completedSessions}
          role="mentor"
          onChanged={loadData}
          emptyText="No completed sessions yet."
        />
      </div>

      {cancelledSessions.length > 0 && (
        <div className="section">
          <h3>Cancelled Sessions</h3>
          <SessionTable sessions={cancelledSessions} role="mentor" onChanged={loadData} emptyText="" />
        </div>
      )}

      {/* Feedback */}
      <div className="section" id="feedback">
        <h3>Feedback From Mentees</h3>
        {feedbackList.length === 0 ? (
          <p className="empty">No feedback received yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mentee</th>
                  <th>Session date</th>
                  <th>Rating</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((feedback) => (
                  <tr key={feedback._id}>
                    <td>{feedback.menteeId ? feedback.menteeId.name : ""}</td>
                    <td>{feedback.sessionId ? formatDate(feedback.sessionId.date) : ""}</td>
                    <td><span className="stars">{showStars(feedback.rating)}</span></td>
                    <td>{feedback.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
