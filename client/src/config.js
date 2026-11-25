// The address of our backend server
export const API_URL = "http://localhost:5000/api";

// Gets a readable error message from a failed Axios request
export function getError(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return "Something went wrong. Is the server running?";
}

// Turns 2026-12-25 into 25 Dec 2026
export function formatDate(text) {
  if (!text) {
    return "";
  }
  const date = new Date(text + "T00:00:00");
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Turns a rating of 4 into ★★★★☆
export function showStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars = stars + (i <= rating ? "★" : "☆");
  }
  return stars;
}
