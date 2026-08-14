# CloudVandana Assignment #1 — Associate Software Engineer

A full-stack web app that performs CRUD (Create, Read, Update, Delete) on Salesforce
standard objects — **Account, Opportunity, Lead, Contact, Case** — selected via a
dropdown, authenticated through Salesforce OAuth 2.0. Built with **React (Vite)** on
the frontend and **Node.js / Express** on the backend.

```
cloudvandana-assignment/
├── server/     Node.js/Express backend — OAuth2 + Salesforce REST API proxy
└── client/     React frontend — login, object picker, CRUD UI, infinite scroll
```

---

## Running the Application

### Backend

cd server
npm install
npm start

Backend:
http://localhost:5000

### Frontend

cd client
npm install
npm run dev

Frontend:
http://localhost:5173


## Authentication Flow

The application uses Salesforce OAuth 2.0. Users authenticate through Salesforce and are redirected back to the application after successful authentication.

## API Integration

The backend acts as a server-side API layer between the React frontend and Salesforce REST API. It handles authentication and Salesforce API requests for the supported objects.