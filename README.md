# MargDisha – One-Stop Personalized Career & Education Advisor

A modern, role-aware Career Guidance Platform focused on helping students and job-seekers discover suitable courses, colleges, and career paths using quizzes, psychometric tests, and an AI adviser.

MargDisha digitizes core career guidance operations such as psychometric assessments, quizzes, college/course discovery, personalized recommendations, saved items, and profile management. It provides a clean frontend (React + Tailwind) and a Node.js/Express backend with MongoDB for persistence.

## Overview
MargDisha enables students and career seekers to:
- **Take psychometric tests** and quizzes to get personalized career recommendations.
- **Get AI-assisted guidance** through an interactive adviser/chatbot.
- **Discover colleges and courses** with searchable lists and detail pages.
- **Save favorites** (colleges & courses) for later review.
- **Track progress** and test history in a user profile.
- **Admin features** to seed data, manage questions, colleges, and courses.

## Screenshots
_Replace these with your own repository screenshots (optional):_
<img width="1200" alt="screenshot-1" src="https://github.com/user-attachments/assets/placeholder-1" />
<img width="1200" alt="screenshot-2" src="https://github.com/user-attachments/assets/placeholder-2" />

## Features

**Authentication & User Management**
- Email & password authentication with JWT.
- Role-aware behavior (basic user / admin actions supported by backend).

**Psychometric Tests & Quizzes**
- Configurable question banks and timed quizzes.
- Test history and score tracking per user.

**AI Adviser / Career Chatbot**
- Chat-based adviser for course/college suggestions and career tips.
- Integrates with Google Generative AI (configurable via env).

**Colleges & Courses**
- Searchable lists of colleges and courses seeded by scripts.
- Detailed pages and save-to-profile functionality.

**Saved Items & Profile**
- Save colleges and courses for later.
- User profile page with test history and saved items.

## UX, Security & Performance
- Server-side validation using Express validator and careful input checks.
- Clean, responsive UI with Tailwind CSS.
- Protected APIs (JWT-based) and middleware for route protection.
- Clear error handling and feedback on both client and server sides.

## Installation

### Clone the repository
```bash
git clone https://github.com/your-username/MargDisha.git
cd MargDisha
```

### Server (backend)
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder with the following variables (example):
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_generative_ai_key (optional)
```

Run the server in development:
```bash
npm run dev
```
The backend listens on port `5000` by default (see `server/package.json` scripts).

### Client (frontend)
```bash
cd client
npm install
npm start
```
The client runs on `http://localhost:3000` and proxies API requests to the server (`http://localhost:5000`).

### Seed sample data
The `server` folder includes seed scripts to populate questions, colleges and courses:
```bash
cd server
npm run seed-questions
npm run seed-colleges
npm run seed-courses
```

## Tech Stack
- **Frontend:** React 18, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken) and password hashing with `bcryptjs`
- **AI / Integrations:** Google Generative AI SDK (optional)

## Project Structure
```bash
.
├── client/                    # React frontend (create-react-app)
│   ├── public/
│   └── src/                   # React app source
├── server/                    # Express backend
│   ├── models/                # Mongoose models (User, Question, College, Course, etc.)
│   ├── routes/                # API routes (auth, quiz, colleges, courses, saved, etc.)
│   ├── utils/                 # Utilities (email, helpers)
│   ├── seedQuestions.js       # Seed scripts
│   └── index.js               # Server entrypoint
├── package.json               # Root utilities / scripts (if any)
└── README.md
```

## Data Handling
- All persistent data is stored in MongoDB and accessed through Mongoose models.
- Question, college, and course data can be seeded using the included scripts.
- Role-based data access enforced in route middleware.

## Contributing
- Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to your branch (`git push origin feature-name`)
5. Open a Pull Request

If you'd like, I can also create a short CONTRIBUTING.md and add a sample .env.example file. Want me to do that?

