# myridius EVOQ — PRD

## Original Problem Statement
Build a commercial lending AI workbench where loan applications are ingested and processed using AI agents, with humans validating results. Three initial screens: Workbench landing page, expanded row AI decisioning, and application detail page with chat + tabbed analysis.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Recharts + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async)
- **AI**: Gemini 2.0 Flash via Emergent Integrations
- **Fonts**: Manrope (headings) + IBM Plex Sans (body)
- **Color**: Teal #55C9A6 primary, white/gray backgrounds

## User Personas
- **Underwriter (Jane Doe)**: Reviews AI recommendations, approves/rejects loans
- **Senior Analyst**: Deep-dives into financial analysis, overrides AI
- **Manager**: Monitors pipeline and overdue applications

## Core Requirements
- Loan application management with CRUD operations
- AI-powered decisioning with expand-in-place summary
- AI chat assistant powered by Gemini 2.0 Flash
- Financial charts (bar+line, radar, mini line charts)
- Review status management with dropdown

## What's Been Implemented (Feb 18, 2026)
- [x] Workbench landing page with status cards (Pending/Awaiting/Completed with overdue counts)
- [x] Applications table with 8 seeded companies (Tesla, Nvidia, Verizon, Pepsi, Walmart, Koch, Home Depot, STO)
- [x] Expandable rows with AI recommendation, company insights, key ratios mini-charts, covenant recommendations, documents
- [x] Application detail page with split view (chat + tabbed content)
- [x] Company Analysis tab with Insights Synthesis, Financial Analysis bar+line chart, Porter's Five Forces radar chart
- [x] AI chat assistant (Gemini 2.0 Flash) on both workbench and detail page
- [x] Search functionality across applications
- [x] Review status dropdown with real-time updates
- [x] Sidebar navigation with branding
- [x] README.md and spec.md documentation

## Prioritized Backlog
### P0 (Next)
- Financial Spreading tab content
- Financial Ratios tab content
- Projections tab content
- Covenants tab content

### P1
- Document upload and AI extraction
- Application creation workflow
- Dashboard analytics page
- AI Review page

### P2
- Multi-user collaboration
- SLA tracking and overdue alerts
- Audit trail
- Export/PDF reports

## Next Tasks
1. Build Financial Spreading tab (user will provide details)
2. Build Financial Ratios tab
3. Build Projections tab
4. Build Covenants tab
5. Dashboard page with aggregate analytics
