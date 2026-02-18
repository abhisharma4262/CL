# myridius EVOQ — Product Specification

## 1. Product Vision
myridius EVOQ is a commercial lending workbench that transforms the underwriting process by placing AI agents at the centre of application processing. Human analysts shift from data-gathering to decision-validation, dramatically reducing turnaround time while maintaining rigorous risk oversight.

## 2. User Personas
| Persona | Role | Primary Goals |
|---------|------|---------------|
| Jane Doe | Underwriter | Review AI recommendations, approve/reject loans, set covenants |
| Senior Analyst | Credit Risk | Override AI decisions, deep-dive into financial analysis |
| Manager | Team Lead | Monitor pipeline, track overdue applications, review dashboards |

## 3. Core Screens (Phase 1)

### 3.1 Workbench (Landing Page)
- **Status Summary Cards**: Pending (underwriter review), Awaiting (instructions for AI agent), Completed (approved & rejected). Each shows count + overdue indicator.
- **Application Table**: Columns — Application No., Applicant Name, Industry, Loan Amount, Legal Entity Type, Application Stage, Documents, Application Status, Review Status. Rows are expandable.
- **Search & Filter**: Full-text search across applications.
- **AI Chat Bar**: Fixed bottom bar for quick underwriting questions across all applications.

### 3.2 Expanded Row (Inline Decisioning)
Triggered by clicking the expand arrow on any application row:
- **AI Agent Recommendation**: Approve/Reject/Hold with rationale
- **Company & Industry Insights**: Financial trajectory, risk exposure, competitive stability
- **Key Ratios**: D/E Ratio and ICR with mini trend charts (3-year)
- **Covenant Recommendations**: Specific metrics with target values
- **Document List**: Uploaded documents with verification status

### 3.3 Application Detail Page
Split-panel layout accessed by clicking an application name:
- **Left Panel — AI Chat**: Application summary card (teal), conversational AI assistant with message history, ability to request analyses
- **Right Panel — Analysis Tabs**:
  - **Company Analysis**: Insights synthesis, financial analysis (bar+line chart), macro-economic analysis (Porter's Five Forces radar chart)
  - **Financial Spreading**: (Phase 2)
  - **Financial Ratios**: (Phase 2)
  - **Projections**: (Phase 2)
  - **Covenants**: (Phase 2)

## 4. Data Model

### LoanApplication
```
{
  id: UUID,
  application_no: string,         // e.g. "CL-3310"
  applicant_name: string,         // e.g. "Tesla"
  industry: string,               // e.g. "Automotive"
  loan_amount: number,            // in dollars
  loan_amount_display: string,    // e.g. "$100 M"
  legal_entity_type: string,      // "Public" | "Private"
  application_stage: string,      // "Underwriting" | "Closing"
  documents_status: string,       // "verified" | "warning" | "missing"
  application_status: string,     // "AI Approved" | "AI Rejected" | "On Hold by AI"
  review_status: string,          // "Review Pending" | "Approved" | "Awaiting Instructions" | "Rejected"
  is_overdue: boolean,
  ai_recommendation: { action, notes },
  company_insights: [string],
  key_ratios: { debt_to_equity: [{year, value}], interest_coverage: [{year, value}] },
  covenant_recommendations: [{ metric, value }],
  documents: [{ name, status }],
  application_summary: string,
  insights_synthesis: string,
  financial_analysis: { summary, financials: [{year, amount, operating_margin}] },
  macro_analysis: { summary, porters_forces: { buyer_power, supplier_power, threat_new_entrants, threat_substitutes, competitive_rivalry } }
}
```

### ChatMessage
```
{
  id: UUID,
  session_id: string,
  application_id: string | null,
  role: "user" | "assistant",
  content: string,
  timestamp: ISO string
}
```

## 5. API Design
| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| GET | /api/applications | — | { applications: [], stats: {} } |
| GET | /api/applications/:id | — | Full application object |
| PUT | /api/applications/:id/review-status | { review_status } | Updated application |
| POST | /api/chat | { session_id, message, application_id? } | { response, message_id } |
| GET | /api/chat/:session_id/history | — | { messages: [] } |
| POST | /api/seed | — | { message, count } |

## 6. AI Integration
- **Provider**: Google Gemini 2.0 Flash via Emergent Integrations
- **System Prompt**: Underwriting AI assistant with access to application data
- **Context**: When application_id is provided, full application data is injected as context
- **Chat History**: Stored in MongoDB, reconstructed per session for context continuity

## 7. Future Phases
- **Phase 2**: Financial Spreading, Financial Ratios, Projections, Covenants tabs
- **Phase 3**: Document upload & AI extraction, multi-user collaboration
- **Phase 4**: Workflow automation, SLA tracking, audit trail
