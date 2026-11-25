import { useState } from "react";
import axios from "axios";
import { API_URL, getError, formatDate } from "../config";
import SessionForm from "./SessionForm";

// Shows a list of sessions in a table.
// props.sessions  -> the sessions to show
// props.role      -> "mentor" or "mentee"
// props.onChanged -> function to reload data after a change
function SessionTable(props) {
  const [editing, setEditing] = useState(null); // the session being edited

  async function cancelSession(id) {
    if (!window.confirm("Do you want to cancel this session?")) {
      return;
    }
    try {
      await axios.put(API_URL + "/sessions/" + id + "/cancel");
      props.onChanged();
    } catch (error) {
      alert(getError(error));
    }
  }

  async function markAttendance(id, value) {
    try {
      await axios.put(API_URL + "/sessions/" + id + "/attendance", { attendance: value });
      props.onChanged();
    } catch (error) {
      alert(getError(error));
    }
  }

  async function saveEdit(data) {
    try {
      await axios.put(API_URL + "/sessions/" + editing._id, {
        date: data.date,
        time: data.time,
        description: data.description,
      });
      setEditing(null);
      props.onChanged();
      return true;
    } catch (error) {
      alert(getError(error));
      return false;
    }
  }

  if (props.sessions.length === 0) {
    return <p className="empty">{props.emptyText}</p>;
  }

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{props.role === "mentor" ? "Mentee" : "Mentor"}</th>
              <th>Date</th>
              <th>Time</th>
              <th>Description</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {props.sessions.map((session) => (
              <tr key={session._id}>
                <td>{props.role === "mentor" ? session.menteeId.name : session.mentorId.name}</td>
                <td>{formatDate(session.date)}</td>
                <td>{session.time}</td>
                <td>{session.description}</td>
                <td>
                  {session.attendance === "not marked" ? (
                    <span className="muted">Not marked</span>
                  ) : (
                    <span className={"badge " + session.attendance}>{session.attendance}</span>
                  )}
                </td>
                <td>
                  <span className={"badge " + session.status}>{session.status}</span>
                </td>
                <td>
                  {session.status === "scheduled" && (
                    <div>
                      <button className="small-button" onClick={() => setEditing(session)}>
                        Edit
                      </button>
                      <button
                        className="small-button green-button"
                        onClick={() => markAttendance(session._id, "attended")}
                      >
                        Attended
                      </button>
                      <button
                        className="small-button orange-button"
                        onClick={() => markAttendance(session._id, "missed")}
                      >
                        Missed
                      </button>
                      <button
                        className="small-button red-button"
                        onClick={() => cancelSession(session._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <div className="edit-box">
          <h4>Edit session</h4>
          <SessionForm
            key={editing._id}
            initial={editing}
            buttonText="Update Session"
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}

export default SessionTable;
