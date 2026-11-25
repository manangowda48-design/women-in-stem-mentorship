import { useState } from "react";

// Form used to schedule a new session and to edit an existing one.
// props.people  -> list of {id, name} to choose from (only when scheduling)
// props.initial -> existing session values (only when editing)
// props.onSave  -> function that saves the data and returns true or false
function SessionForm(props) {
  const initial = props.initial || {};

  const [otherId, setOtherId] = useState("");
  const [date, setDate] = useState(initial.date || "");
  const [time, setTime] = useState(initial.time || "");
  const [description, setDescription] = useState(initial.description || "");

  async function handleSubmit(e) {
    e.preventDefault();
    const saved = await props.onSave({
      otherId: otherId,
      date: date,
      time: time,
      description: description,
    });

    // Clear the form after scheduling a new session
    if (saved && !props.initial) {
      setOtherId("");
      setDate("");
      setTime("");
      setDescription("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {props.people && (
        <div>
          <label>Session with</label>
          <select value={otherId} onChange={(e) => setOtherId(e.target.value)} required>
            <option value="">-- Select --</option>
            {props.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <label>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

      <label>Time</label>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

      <label>Short description</label>
      <input
        type="text"
        placeholder="What will you discuss?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">{props.buttonText}</button>
      {props.onCancel && (
        <button type="button" className="gray-button" onClick={props.onCancel}>
          Close
        </button>
      )}
    </form>
  );
}

export default SessionForm;
