# Women in STEM Mentorship Platform (MERN)

A beginner-level MERN project that covers the full workflow:

Registration -> Mentor Discovery -> Mentorship Request -> Acceptance -> Session Scheduling -> Attendance -> Feedback

## What you need
- Node.js
- MongoDB running on your computer (default address `mongodb://127.0.0.1:27017`).
  If you use MongoDB Atlas, replace the connection string in `server/server.js`.

## How to run (use two terminals)

Terminal 1 - backend:

    cd server
    npm install
    node server.js

You should see "Server running on http://localhost:5000" and "MongoDB connected".

Terminal 2 - frontend:

    cd client
    npm install
    npm start

The app opens at http://localhost:3000

## How to test the whole workflow

1. Register a **Mentor** (example interests: Biology, Data Science). Log in.
2. On the Mentor Dashboard, fill in and save the **Mentor Profile** (expertise: Biology).
3. Logout. Register a **Mentee** (interests: Biology). Log in.
4. On the Mentee Dashboard, click "Show mentors matching my interests" and press **Send Request**.
5. Logout, log in as the mentor, and **Accept** the request.
6. As the mentor (or mentee), **Schedule a Session**. You can Edit or Cancel it.
7. Click **Attended** or **Missed** on the session. It moves to "Completed Sessions".
8. Log in as the mentee and **Submit Feedback** (rating 1-5 + comments).
9. Log in as the mentor to see the **feedback** and the average rating.

Dashboards show fresh data after every action. Use the **Refresh** button to see changes made by the other person.

## Folder structure

    client/
      public/index.html
      src/
        App.js, App.css, index.js, config.js
        components/  Navbar, MentorCard, ProfileForm, SessionForm, SessionTable, FeedbackForm
        pages/       Login, Register, MenteeDashboard, MentorDashboard
    server/
      server.js
      models/   User, MentorProfile, MentorshipRequest, Session, Feedback
      routes/   auth, mentors, requests, sessions, feedback

## API routes

| Method | Route | What it does |
|---|---|---|
| POST | /api/auth/register | Register a mentor or mentee |
| POST | /api/auth/login | Login |
| GET | /api/mentors?interests=a,b | List mentors (filtered by interests if given) |
| GET | /api/mentors/:userId | Get one mentor's profile |
| PUT | /api/mentors/:userId | Create or update a mentor profile |
| POST | /api/requests | Mentee sends a request |
| GET | /api/requests/mentee/:id | Requests sent by a mentee |
| GET | /api/requests/mentor/:id | Requests received by a mentor |
| PUT | /api/requests/:id | Accept or reject a request |
| POST | /api/sessions | Schedule a session (request must be accepted) |
| GET | /api/sessions/user/:userId | All sessions of a user |
| PUT | /api/sessions/:id | Update date, time, description |
| PUT | /api/sessions/:id/cancel | Cancel a session |
| PUT | /api/sessions/:id/attendance | Mark attended or missed |
| POST | /api/feedback | Mentee submits feedback |
| GET | /api/feedback/mentor/:id | Feedback received by a mentor |
| GET | /api/feedback/mentee/:id | Feedback given by a mentee |

## Notes
- Passwords are stored hashed with `bcryptjs`.
- The logged-in user is kept in the browser's localStorage. There is no token-based login, to keep the project simple, so this is for learning and not for production.
- "Real-time" is handled by reloading the dashboard data after each action and with the Refresh button (no WebSockets).
