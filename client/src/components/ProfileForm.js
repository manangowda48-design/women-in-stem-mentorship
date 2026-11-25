import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, getError } from "../config";

// Form where a mentor creates or updates their profile
function ProfileForm(props) {
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  // Load the saved profile when the page opens
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get(API_URL + "/mentors/" + props.user._id);
        if (response.data) {
          setExpertise(response.data.expertise.join(", "));
          setExperience(response.data.experience);
          setBio(response.data.bio);
        }
      } catch (error) {
        setMessage(getError(error));
      }
    }
    loadProfile();
  }, [props.user._id]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.put(API_URL + "/mentors/" + props.user._id, {
        expertise: expertise,
        experience: experience,
        bio: bio,
      });
      setMessage("Profile saved!");
    } catch (error) {
      setMessage(getError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Your name: <strong>{props.user.name}</strong></p>

      <label>Area of STEM expertise (separate with commas)</label>
      <input
        type="text"
        placeholder="Example: Biology, Data Science"
        value={expertise}
        onChange={(e) => setExpertise(e.target.value)}
        required
      />

      <label>Experience</label>
      <input
        type="text"
        placeholder="Example: 5 years in research"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        required
      />

      <label>Short biography</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />

      <button type="submit">Save Profile</button>
      {message !== "" && <p className="notice">{message}</p>}
    </form>
  );
}

export default ProfileForm;
