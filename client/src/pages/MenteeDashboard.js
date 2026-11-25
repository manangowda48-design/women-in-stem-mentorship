import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, getError, formatDate, showStars } from "../config";
import MentorCard from "../components/MentorCard";
import SessionForm from "../components/SessionForm";
import SessionTable from "../components/SessionTable";
import FeedbackForm from "../components/FeedbackForm";

function MenteeDashboard(props) {
  const user = props.user;
  const myInterests = user.interests || [];

  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [showMatching, setShowMatching] = useState(false);
  const [message, setMessage] = useState("");

  // Loads the latest data from the server
  async function loadData() {
    try {
      let mentorUrl = API_URL + "/mentors";
      if (showMatching) {
        mentorUrl = mentorUrl + "?interests=" + encodeURIComponent(myInterests.join(","));
      }

      const mentorResponse = await axios.get(mentorUrl);
      const requestResponse = await axios.get(API_URL + "/requests/mentee/" + user._id);
      const sessionResponse = await axios.get(API_URL + "/sessions/user/" + user._id);
      const feedbackResponse = await axios.get(API_URL + "/feedback/mentee/" + user._id);

      setMentors(mentorResponse.data);
      setRequests(requestResponse.data);
      setSessions(sessionResponse.data);
      setFeedbackList(feedbackResponse.data);
    } catch (error) {
      setMessage(getError(error));
    }
  }

  // Load data when the page opens and when the filter button is clicked
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMatching]);

  // ----- Actions -----
  async function sendRequest(mentorUserId) {
    try {
      await axios.post(API_URL + "/requests", { mentorId: mentorUserId, menteeId: user._id });
      setMessage("Mentorship request sent!");
      loadData();
    } catch (error) {
      setMessage(getError(error));
    }
  }

  async function scheduleSession(data) {
    try {
      await axios.post(API_URL + "/sessions", {
        mentorId: data.otherId,
        menteeId: user._id,
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

  async function submitFeedback(data) {
    try {
      await axios.post(API_URL + "/feedback", {
        sessionId: data.sessionId,
        menteeId: user._id,
        rating: data.rating,
        comments: data.comments,
      });
      setMessage("Thank you! Feedback submitted.");
      loadData();
      return true;
    } catch (error) {
      setMessage(getError(error));
      return false;
    }
  }

  // ----- Helper calculations -----

  // Finds the status of the request sent to a mentor ("" means no request yet)
  function getRequestStatus(mentorUserId) {
    for (let i = 0; i < requests.length; i++) {
      if (requests[i].mentorId && requests[i].mentorId._id === mentorUserId) {
        if (requests[i].status !== "rejected") {
          return requests[i].status;
        }
      }
    }
    return "";
  }

  // Mentors who accepted my request (I can schedule sessions with them)
  const acceptedMentors = [];
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].status === "accepted" && requests[i].mentorId) {
      acceptedMentors.push({ id: requests[i].mentorId._id, name: requests[i].mentorId.name });
    }
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const cancelledSessions = sessions.filter((s) => s.status === "cancelled");

  // Completed sessions where I have not given feedback yet
  const sessionsNeedingFeedback = [];
  for (let i = 0; i < completedSessions.length; i++) {
    let alreadyGiven = false;
    for (let j = 0; j < feedbackList.length; j++) {
      if (feedbackList[j].sessionId && feedbackList[j].sessionId._id === completedSessions[i]._id) {
        alreadyGiven = true;
      }
    }
    if (!alreadyGiven) {
      sessionsNeedingFeedback.push(completedSessions[i]);
    }
  }

  // Attendance and progress numbers
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

  const totalSessions = upcomingSessions.length + completedSessions.length;

  return (
    <div>
      <div className="page-head">
        <div className="container">
          <div className="top-row">
            <div>
              <h2>Hi, {user.name.split(" ")[0]}</h2>
              <p>Find a mentor, book sessions and track your progress.</p>
            </div>
            <button className="small-button outline-button" onClick={loadData}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <nav className="jump-nav">
        <div className="container">
          <a href="#mentors">Mentors</a>
          <a href="#requests">Requests</a>
          <a href="#sessions">Sessions</a>
          <a href="#feedback">Feedback</a>
        </div>
      </nav>

      <div className="container">

      {message !== "" && <p className="notice">{message}</p>}

      {/* Progress and attendance */}
      <div className="section">
        <h3>My Progress and Attendance</h3>
        <div className="stats">
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
            <strong>{feedbackList.length}</strong>
            <span>Feedback given</span>
          </div>
          <div className="stat-box">
            <strong>{averageRating}</strong>
            <span>Average rating</span>
          </div>
        </div>
        <p>
          Mentorship progress: {completedSessions.length} of {totalSessions} sessions completed
        </p>
        <progress value={completedSessions.length} max={totalSessions === 0 ? 1 : totalSessions} />
      </div>

      {/* Find mentors */}
      <div className="section" id="mentors">
        <h3>Available Mentors</h3>
        <p>My interests: {myInterests.length > 0 ? myInterests.join(", ") : "none added"}</p>
        <button className="small-button" onClick={() => setShowMatching(!showMatching)}>
          {showMatching ? "Show all mentors" : "Show mentors matching my interests"}
        </button>

        {mentors.length === 0 ? (
          <p className="empty">No mentors found.</p>
        ) : (
          <div className="card-grid">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                requestStatus={getRequestStatus(mentor.userId._id)}
                onRequest={sendRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* My requests */}
      <div className="section" id="requests">
        <h3>My Mentorship Requests</h3>
        {requests.length === 0 ? (
          <p className="empty">You have not sent any requests yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.mentorId ? request.mentorId.name : "Unknown"}</td>
                    <td>
                      <span className={"badge " + request.status}>{request.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="section" id="schedule">
        <h3>Schedule a Session</h3>
        {acceptedMentors.length === 0 ? (
          <p className="empty">You can schedule sessions after a mentor accepts your request.</p>
        ) : (
          <SessionForm people={acceptedMentors} buttonText="Schedule Session" onSave={scheduleSession} />
        )}
      </div>

      {/* Sessions */}
      <div className="section" id="sessions">
        <h3>Upcoming Sessions</h3>
        <SessionTable
          sessions={upcomingSessions}
          role="mentee"
          onChanged={loadData}
          emptyText="No upcoming sessions."
        />
      </div>

      <div className="section">
        <h3>Completed Sessions</h3>
        <SessionTable
          sessions={completedSessions}
          role="mentee"
          onChanged={loadData}
          emptyText="No completed sessions yet."
        />
      </div>

      {cancelledSessions.length > 0 && (
        <div className="section">
          <h3>Cancelled Sessions</h3>
          <SessionTable sessions={cancelledSessions} role="mentee" onChanged={loadData} emptyText="" />
        </div>
      )}

      {/* Feedback */}
      <div className="section" id="feedback">
        <h3>Submit Progress Feedback</h3>
        <FeedbackForm sessions={sessionsNeedingFeedback} onSubmit={submitFeedback} />
      </div>

      <div className="section">
        <h3>My Feedback History</h3>
        {feedbackList.length === 0 ? (
          <p className="empty">No feedback submitted yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Session date</th>
                  <th>Rating</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((feedback) => (
                  <tr key={feedback._id}>
                    <td>{feedback.mentorId ? feedback.mentorId.name : ""}</td>
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

export default MenteeDashboard;
