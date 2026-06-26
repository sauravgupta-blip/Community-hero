# 🏘️ Community Hero — Hyperlocal Problem Solver

> See it. Report it. Fix it.

Community Hero is a hyperlocal civic-tech platform that empowers citizens to identify, report, validate, and track local infrastructure issues — potholes, water leaks, broken streetlights, garbage overflow, and more — while giving municipal authorities a transparent way to act on them.

🔗 **Live App:** [community-hero-two.vercel.app](https://community-hero-two.vercel.app)
🔗 **Backend API:** [community-hero-production.up.railway.app](https://community-hero-production.up.railway.app)

---

## 📌 Background

Communities frequently face infrastructure issues that go unreported or untracked due to fragmented, opaque reporting processes. There's no easy way for citizens to flag problems, verify them with neighbors, or follow their resolution — leading to delayed civic action and frustrated residents.

## 💡 Solution

Community Hero gives citizens a simple, AI-assisted way to report issues with a photo and description. The platform automatically:
- Detects the issue category and severity using AI
- Captures GPS location
- Detects duplicate reports nearby and merges them instead of creating clutter
- Routes the report to the correct municipal department
- Lets the community verify, vote on, and track issues through to resolution

This creates **transparency, accountability, and citizen participation** in solving local problems.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 **Image-based Reporting** | Upload a photo and description of any civic issue |
| 🤖 **AI-Powered Categorization** | Gemini AI automatically detects issue category & severity (with keyword-based fallback for reliability) |
| 📍 **Geo-Location & Mapping** | Captures live GPS coordinates and links directly to Google Maps |
| 🚨 **Severity Self-Rating** | Citizens rate urgency (Low/Medium/High/Urgent) at the time of reporting |
| 🕶️ **Anonymous Reporting** | Option to report issues without revealing identity |
| 🔁 **Duplicate Detection** | Automatically detects and merges reports of the same issue within 50m, preventing redundant entries |
| ✅ **Community Verification** | Neighbors can verify reported issues to confirm credibility |
| 👍 **Upvote / Downvote** | Citizens can vote on issue severity and importance (toggleable) |
| 📊 **Real-Time Issue Tracking** | 4-stage progress tracker: Issue Raised → Verified → Work Started → Resolved |
| 📷 **Before/After Comparison** | Authorities upload a resolution photo, shown side-by-side with the original report |
| 📈 **Impact Dashboard** | Live stats on total issues, resolutions, and category breakdown |
| 🔮 **Predictive Insights** | Highlights the most-reported issue category as a priority area for authorities |
| 🏆 **Gamification** | "Top Community Heroes" leaderboard recognizing active reporters |
| ✍️ **Smart Suggestions** | Autocomplete suggestions while typing issue descriptions |
| 🏛️ **Direct Authority Routing** | Auto-displays the relevant municipal department's contact info |

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Inline CSS (no external UI library, custom design system)
- Deployed on Vercel

**Backend**
- Node.js + Express.js
- Deployed on Railway

**Database**
- MongoDB Atlas

**AI / Intelligence**
- Google Gemini API (image + text-based issue categorization)
- Keyword-based fallback classification for reliability

**Other**
- Browser Geolocation API for live GPS capture
- Google Maps linking for visual location reference
- Haversine distance formula for duplicate-issue detection

---

## 🗂️ Project Structure

    community-hero/
    ├── frontend/              React frontend
    │   ├── src/
    │   │   ├── App.js         Main application (landing page + report page)
    │   │   └── ...
    │   └── package.json
    ├── models/
    │   └── issue.js           MongoDB schema for issues
    ├── routes/
    │   └── issueRoutes.js     API endpoints (create, list, verify, vote, update status)
    ├── services/
    │   └── googleAIService.js Gemini AI integration
    ├── server.js               Express server entry point
    └── package.json

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/issues` | Submit a new issue report (with built-in duplicate detection) |
| `GET` | `/api/issues` | Get all reported issues |
| `GET` | `/api/issues/:id` | Get a single issue by ID |
| `POST` | `/api/issues/:id/verify` | Add a community verification |
| `POST` | `/api/issues/:id/vote` | Upvote or downvote an issue (toggleable) |
| `PATCH` | `/api/issues/:id/status` | Update issue status (optionally with an "after" resolution photo) |
| `GET` | `/api/issues/stats/all` | Get aggregate stats (totals, category breakdown) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js
- MongoDB Atlas account
- Google AI Studio API key

### Backend Setup

Clone the repo and install dependencies:

    git clone https://github.com/sauravgupta-blip/community-hero.git
    cd community-hero
    npm install

Create a `.env` file in the root with:

    MONGO_URI=your_mongodb_connection_string
    GOOGLE_AI_API_KEY=your_gemini_api_key
    PORT=5000

Run the backend:

    node server.js

### Frontend Setup

    cd frontend
    npm install
    npm start

---

## 🎯 Future Enhancements

- Video-based issue reporting
- User authentication and personal dashboards
- Admin/authority panel for official status updates
- Push notifications for status changes
- Interactive map view of all reported issues

---

## 👤 Author

Built by Saurav Gupta as a hyperlocal civic problem-solving platform.

---

*Built for the community, by the community.*
