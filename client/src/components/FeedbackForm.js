import { useState } from "react";

// Form where a mentee gives a rating and comments for a completed session.
// props.sessions -> completed sessions that still need feedback
// props.onSubmit -> function that saves the feedback and returns true or false
function FeedbackForm(props) {
  const [sessionId, setSessionId] = useState("");
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const saved = await props.onSubmit({
      sessionId: sessionId,
      rating: Number(rating),
      comments: comments,
    });

    if (saved) {
      setSessionId("");
      setRating("5");
      setComments("");
    }
  }

  if (props.sessions.length === 0) {
    return <p className="empty">No completed sessions are waiting for feedback.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Session</label>
      <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
        <option value="">-- Select a completed session --</option>
        {props.sessions.map((session) => (
          <option key={session._id} value={session._id}>
            {session.date} with {session.mentorId.name}
          </option>
        ))}
      </select>

      <label>Rating (1 = low, 5 = excellent)</label>
      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>

      <label>Comments</label>
      <textarea value={comments} onChange={(e) => setComments(e.target.value)} required />

      <button type="submit">Submit Feedback</button>
    </form>
  );
}

export default FeedbackForm;
