# myridius EVOQ — Commercial Lending AI Workbench

## Overview
myridius EVOQ is an AI-powered commercial lending workbench that automates how commercial loan applications are managed. Applications are ingested and processed using AI agents, with human analysts validating and overriding the AI's decisions.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Recharts + Framer Motion
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **AI**: Gemini 2.0 Flash via Emergent Integrations for underwriting AI assistant

## Key Screens
1. **Workbench (Landing Page)** — All loan applications in a data table with status summary cards, search/filter, and a quick AI assistant bar
2. **Expanded Row** — Inline AI decisioning summary: recommendation, company insights, key ratios, covenant recommendations
3. **Application Detail** — Split view: left chat panel (AI assistant) + right tabbed analysis (Company Analysis, Financial Spreading, Financial Ratios, Projections, Covenants)

## Quick Start
```bash
# Backend runs on port 8001 (managed by supervisor)
# Frontend runs on port 3000 (managed by supervisor)

# Seed the database with initial application data
curl -X POST $REACT_APP_BACKEND_URL/api/seed
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applications | List all applications with stats |
| GET | /api/applications/:id | Get application detail |
| PUT | /api/applications/:id/review-status | Update review status |
| POST | /api/chat | Send message to AI assistant |
| GET | /api/chat/:session_id/history | Get chat history |
| POST | /api/seed | Seed database with initial data |

## Environment Variables
### Backend (.env)
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — Database name
- `GEMINI_API_KEY` — Google Gemini API key for AI chat

### Frontend (.env)
- `REACT_APP_BACKEND_URL` — Backend API base URL
