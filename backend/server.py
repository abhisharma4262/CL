from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Pydantic Models ----------
class ReviewStatusUpdate(BaseModel):
    review_status: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    application_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    message_id: str

# ---------- Seed Data ----------
def get_seed_applications():
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3310",
            "applicant_name": "Tesla",
            "industry": "Automotive",
            "loan_amount": 100000000,
            "loan_amount_display": "$100 M",
            "legal_entity_type": "Public",
            "application_stage": "Underwriting",
            "documents_status": "verified",
            "application_status": "AI Approved",
            "review_status": "Review Pending",
            "is_overdue": True,
            "ai_recommendation": {"action": "Approve Loan", "notes": "Approve loan with stringent covenants"},
            "company_insights": [
                "Financial trajectory: 34.1% revenue CAGR (2021-2023) with $15B net income, but operating margins declined sharply from 16.9% to 9.2%, indicating potential debt servicing pressure.",
                "Risk Exposure: High geopolitical vulnerability with 25% of production in China; US market share fell from 65% to 50% amid competition, necessitating liquidity-focused loan covenants.",
                "Competitive Stability: Strong differentiators (50,000+ Supercharger stations, vertical integration) & $7,500 government incentives provide medium-term stability."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 0.79}, {"year": "FY'23", "value": 0.68}, {"year": "FY'24", "value": 0.73}],
                "interest_coverage": [{"year": "FY'22", "value": 71}, {"year": "FY'23", "value": 27}, {"year": "FY'24", "value": 51}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Debt Service Coverage Ratio", "value": "1.5x"},
                {"metric": "Min. Liquidity Reserve", "value": "$15B"},
                {"metric": "Max. Debt to EBIDTA Ratio", "value": "3.0x"}
            ],
            "documents": [
                {"name": "P&L_TESLA", "status": "verified"},
                {"name": "Cashflow Statement_TESLA", "status": "verified"},
                {"name": "Consolidated Balance Sheet_TESLA", "status": "verified"}
            ],
            "application_summary": "Tesla is applying for a $100 M loan to fund facility expansion and new machinery, with collateral including machinery ($1.5M) and corporate guarantees, requesting a 7-year term at 5.5% fixed interest with a 6-month interest-only period.",
            "insights_synthesis": "Tesla faces transformative period with moderating growth and intense competition, particularly from BYD. Strong Energy segment and manufacturing innovations offset automotive margin pressure. Financial resilience despite market challenges suggests cautious optimism for loan visibility.",
            "financial_analysis": {
                "summary": "While Tesla maintains substantial revenue, its profitability is under significant pressure. Consider both the current margin compression and Tesla's potential for margin recovery through manufacturing efficiencies (4680 batteries Gigacasting) and growth in higher margin business segments (Energy potential FSD revenue).",
                "financials": [{"year": "2022", "amount": 60, "operating_margin": 14}, {"year": "2023", "amount": 80, "operating_margin": 10}, {"year": "2024", "amount": 95, "operating_margin": 9}]
            },
            "macro_analysis": {
                "summary": "Insight into the competitive dynamics of the EV industry and applicant's position within it",
                "porters_forces": {
                    "buyer_power": {"score": 4, "description": "High - More options for consumers as competition increases."},
                    "supplier_power": {"score": 3, "description": "Moderate - Some vertical integration, but dependent on raw materials."},
                    "threat_new_entrants": {"score": 3, "description": "Moderate. Capital requirements high, but legacy automakers transitioning to EVs."},
                    "threat_substitutes": {"score": 3, "description": "Moderate - Hybrid vehicles and hydrogen technology as alternatives."},
                    "competitive_rivalry": {"score": 4, "description": "High - Intense competition from BYD, legacy automakers, and new entrants."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3345",
            "applicant_name": "Nvidia",
            "industry": "Technology",
            "loan_amount": 170000000,
            "loan_amount_display": "$170 M",
            "legal_entity_type": "Public",
            "application_stage": "Underwriting",
            "documents_status": "verified",
            "application_status": "AI Approved",
            "review_status": "Review Pending",
            "is_overdue": True,
            "ai_recommendation": {"action": "Approve Loan", "notes": "Strong financials support approval with standard covenants"},
            "company_insights": [
                "Revenue growth: 126% YoY growth driven by data center GPU demand, with $60.9B annual revenue and $29.8B net income.",
                "Market dominance: >80% market share in AI training GPUs; strong moat from CUDA ecosystem and developer tools.",
                "Risk factors: Concentration in AI/ML segment; regulatory risks from export controls to China affecting ~20% revenue."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 0.41}, {"year": "FY'23", "value": 0.54}, {"year": "FY'24", "value": 0.29}],
                "interest_coverage": [{"year": "FY'22", "value": 43}, {"year": "FY'23", "value": 33}, {"year": "FY'24", "value": 132}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Debt Service Coverage Ratio", "value": "2.0x"},
                {"metric": "Min. Liquidity Reserve", "value": "$20B"},
                {"metric": "Max. Debt to EBIDTA Ratio", "value": "2.5x"}
            ],
            "documents": [
                {"name": "P&L_NVIDIA", "status": "verified"},
                {"name": "Cashflow Statement_NVIDIA", "status": "verified"},
                {"name": "Consolidated Balance Sheet_NVIDIA", "status": "verified"}
            ],
            "application_summary": "Nvidia is applying for a $170 M loan to expand data center manufacturing capacity and R&D facilities, with collateral including intellectual property and corporate guarantees, requesting a 5-year term at 4.8% fixed interest.",
            "insights_synthesis": "Nvidia dominates the AI accelerator market with exceptional growth trajectory. High dependency on data center segment presents concentration risk, but technological moat and ecosystem lock-in provide strong medium-term stability.",
            "financial_analysis": {
                "summary": "Nvidia's financial performance is exceptionally strong with record revenue and margins. The primary risk lies in the cyclical nature of semiconductor demand and potential regulatory headwinds from export restrictions.",
                "financials": [{"year": "2022", "amount": 27, "operating_margin": 38}, {"year": "2023", "amount": 27, "operating_margin": 21}, {"year": "2024", "amount": 61, "operating_margin": 54}]
            },
            "macro_analysis": {
                "summary": "Analysis of the semiconductor and AI infrastructure industry dynamics",
                "porters_forces": {
                    "buyer_power": {"score": 2, "description": "Low - Limited alternatives for high-end AI training GPUs."},
                    "supplier_power": {"score": 3, "description": "Moderate - Dependent on TSMC for fabrication."},
                    "threat_new_entrants": {"score": 2, "description": "Low - Extremely high barriers: R&D costs, ecosystem lock-in."},
                    "threat_substitutes": {"score": 2, "description": "Low - Custom ASICs emerging but CUDA ecosystem dominates."},
                    "competitive_rivalry": {"score": 3, "description": "Moderate - AMD and Intel compete but Nvidia holds commanding lead."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CI-3405",
            "applicant_name": "Verizon",
            "industry": "Telecom",
            "loan_amount": 50000000,
            "loan_amount_display": "$50 M",
            "legal_entity_type": "Public",
            "application_stage": "Underwriting",
            "documents_status": "verified",
            "application_status": "AI Rejected",
            "review_status": "Review Pending",
            "is_overdue": False,
            "ai_recommendation": {"action": "Reject Loan", "notes": "High debt burden and declining subscriber growth present elevated risk"},
            "company_insights": [
                "Debt concern: Total debt of $150B with D/E ratio of 1.69, significantly above industry median of 1.2.",
                "Revenue stagnation: Wireless service revenue grew only 3.2% YoY while facing aggressive pricing from T-Mobile.",
                "Positive: Strong infrastructure assets and steady cash flow generation from legacy business."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 1.72}, {"year": "FY'23", "value": 1.65}, {"year": "FY'24", "value": 1.69}],
                "interest_coverage": [{"year": "FY'22", "value": 8.2}, {"year": "FY'23", "value": 6.1}, {"year": "FY'24", "value": 5.8}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Debt Service Coverage Ratio", "value": "1.8x"},
                {"metric": "Max. Leverage Ratio", "value": "4.0x"},
                {"metric": "Min. EBITDA Margin", "value": "35%"}
            ],
            "documents": [
                {"name": "P&L_VERIZON", "status": "verified"},
                {"name": "Cashflow Statement_VERIZON", "status": "verified"},
                {"name": "Consolidated Balance Sheet_VERIZON", "status": "verified"}
            ],
            "application_summary": "Verizon is applying for a $50 M loan for 5G network expansion, with collateral including network infrastructure and spectrum licenses, requesting a 10-year term at 6.2% fixed interest.",
            "insights_synthesis": "Verizon faces headwinds from high debt load and competitive pricing pressure in wireless. Strong infrastructure base provides stability but growth outlook is limited.",
            "financial_analysis": {
                "summary": "Verizon's revenue remains stable but growth is muted. The high debt burden from spectrum acquisitions constrains financial flexibility and increases risk profile for new lending.",
                "financials": [{"year": "2022", "amount": 136, "operating_margin": 24}, {"year": "2023", "amount": 134, "operating_margin": 22}, {"year": "2024", "amount": 135, "operating_margin": 23}]
            },
            "macro_analysis": {
                "summary": "Telecom industry dynamics and competitive positioning analysis",
                "porters_forces": {
                    "buyer_power": {"score": 4, "description": "High - Low switching costs, commoditized services."},
                    "supplier_power": {"score": 2, "description": "Low - Multiple equipment vendors available."},
                    "threat_new_entrants": {"score": 1, "description": "Very Low - Massive capital requirements and spectrum licensing."},
                    "threat_substitutes": {"score": 3, "description": "Moderate - Satellite internet and Wi-Fi alternatives emerging."},
                    "competitive_rivalry": {"score": 5, "description": "Very High - Intense competition from T-Mobile, AT&T."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3466",
            "applicant_name": "Pepsi",
            "industry": "Consumer",
            "loan_amount": 96000000,
            "loan_amount_display": "$96 M",
            "legal_entity_type": "Public",
            "application_stage": "Underwriting",
            "documents_status": "warning",
            "application_status": "On Hold by AI",
            "review_status": "Awaiting Instructions",
            "is_overdue": False,
            "ai_recommendation": {"action": "Hold", "notes": "Missing quarterly financial statements; awaiting updated cash flow projections"},
            "company_insights": [
                "Stable business: Diversified portfolio across beverages and snacks with consistent 5-7% organic revenue growth.",
                "Document gap: Q3 2024 financial statements not yet submitted; cash flow projections need updating.",
                "Strong brand portfolio: Frito-Lay and Quaker segments provide resilient cash flows."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 2.28}, {"year": "FY'23", "value": 2.35}, {"year": "FY'24", "value": 2.19}],
                "interest_coverage": [{"year": "FY'22", "value": 11.4}, {"year": "FY'23", "value": 10.2}, {"year": "FY'24", "value": 9.8}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Interest Coverage Ratio", "value": "8.0x"},
                {"metric": "Max. Net Debt/EBITDA", "value": "3.5x"},
                {"metric": "Min. Current Ratio", "value": "0.9x"}
            ],
            "documents": [
                {"name": "P&L_PEPSI", "status": "verified"},
                {"name": "Cashflow Statement_PEPSI", "status": "warning"},
                {"name": "Balance Sheet_PEPSI", "status": "verified"}
            ],
            "application_summary": "PepsiCo is applying for a $96 M loan for supply chain modernization and distribution center expansion, requesting a 5-year term at 5.0% fixed interest with quarterly repayments.",
            "insights_synthesis": "PepsiCo has a robust and diversified portfolio, but document completeness issues are holding up the review. Once financial statements are updated, the application can proceed.",
            "financial_analysis": {
                "summary": "PepsiCo maintains steady revenue growth and solid margins. The Frito-Lay segment continues to be the primary margin driver. Focus on document completion to proceed with underwriting.",
                "financials": [{"year": "2022", "amount": 86, "operating_margin": 13}, {"year": "2023", "amount": 91, "operating_margin": 14}, {"year": "2024", "amount": 92, "operating_margin": 13}]
            },
            "macro_analysis": {
                "summary": "Consumer staples industry competitive dynamics",
                "porters_forces": {
                    "buyer_power": {"score": 3, "description": "Moderate - Retailers have negotiating power but brand loyalty persists."},
                    "supplier_power": {"score": 2, "description": "Low - Diversified agricultural inputs, multiple sourcing options."},
                    "threat_new_entrants": {"score": 2, "description": "Low - Significant brand investment and distribution networks required."},
                    "threat_substitutes": {"score": 3, "description": "Moderate - Health-conscious trends shifting demand patterns."},
                    "competitive_rivalry": {"score": 4, "description": "High - Intense competition with Coca-Cola and private labels."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3411",
            "applicant_name": "Walmart",
            "industry": "Consumer",
            "loan_amount": 240000000,
            "loan_amount_display": "$240 M",
            "legal_entity_type": "Public",
            "application_stage": "Closing",
            "documents_status": "verified",
            "application_status": "AI Approved",
            "review_status": "Approved",
            "is_overdue": False,
            "ai_recommendation": {"action": "Approve Loan", "notes": "Strong cash flows and market position support approval"},
            "company_insights": [
                "Market leader: World's largest retailer with $648B revenue and consistent e-commerce growth (+23% YoY).",
                "Cash generation: $36B operating cash flow provides strong debt servicing capacity.",
                "Defensive positioning: Consumer staples focus provides recession resilience."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 0.73}, {"year": "FY'23", "value": 0.68}, {"year": "FY'24", "value": 0.62}],
                "interest_coverage": [{"year": "FY'22", "value": 9.8}, {"year": "FY'23", "value": 11.2}, {"year": "FY'24", "value": 12.5}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Debt Service Coverage Ratio", "value": "1.5x"},
                {"metric": "Max. Debt to EBIDTA Ratio", "value": "3.0x"},
                {"metric": "Min. Liquidity Reserve", "value": "$10B"}
            ],
            "documents": [
                {"name": "P&L_WALMART", "status": "verified"},
                {"name": "Cashflow Statement_WALMART", "status": "verified"},
                {"name": "Consolidated Balance Sheet_WALMART", "status": "verified"}
            ],
            "application_summary": "Walmart is applying for a $240 M loan for distribution center automation and e-commerce fulfillment expansion, requesting a 7-year term at 4.5% fixed interest.",
            "insights_synthesis": "Walmart's dominant market position and strong cash flows make this a low-risk lending opportunity. E-commerce growth trajectory adds upside potential.",
            "financial_analysis": {
                "summary": "Walmart's financial profile is robust with consistent revenue growth and improving margins from automation investments. Strong free cash flow generation supports the requested loan amount.",
                "financials": [{"year": "2022", "amount": 573, "operating_margin": 4.5}, {"year": "2023", "amount": 611, "operating_margin": 4.2}, {"year": "2024", "amount": 648, "operating_margin": 4.6}]
            },
            "macro_analysis": {
                "summary": "Retail industry competitive dynamics and market positioning",
                "porters_forces": {
                    "buyer_power": {"score": 4, "description": "High - Price-sensitive consumers with many alternatives."},
                    "supplier_power": {"score": 1, "description": "Very Low - Walmart's scale gives enormous bargaining power."},
                    "threat_new_entrants": {"score": 2, "description": "Low - Scale economics create significant barriers."},
                    "threat_substitutes": {"score": 3, "description": "Moderate - E-commerce platforms like Amazon compete directly."},
                    "competitive_rivalry": {"score": 4, "description": "High - Intense from Amazon, Costco, Target."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3314",
            "applicant_name": "Koch Industries",
            "industry": "Manufacturing",
            "loan_amount": 85000000,
            "loan_amount_display": "$85 M",
            "legal_entity_type": "Private",
            "application_stage": "Underwriting",
            "documents_status": "missing",
            "application_status": "On Hold by AI",
            "review_status": "Review Pending",
            "is_overdue": False,
            "ai_recommendation": {"action": "Hold", "notes": "Critical financial documents missing; unable to complete risk assessment"},
            "company_insights": [
                "Private entity: Limited public financial data available; dependent on submitted documentation.",
                "Diversified conglomerate: Operations spanning refining, chemicals, paper, and technology.",
                "Document deficit: Annual audited financials and tax returns not yet received."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 0.45}, {"year": "FY'23", "value": 0.52}, {"year": "FY'24", "value": 0.48}],
                "interest_coverage": [{"year": "FY'22", "value": 15}, {"year": "FY'23", "value": 12}, {"year": "FY'24", "value": 14}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Debt Service Coverage Ratio", "value": "1.8x"},
                {"metric": "Max. Leverage Ratio", "value": "2.5x"},
                {"metric": "Annual Audit Requirement", "value": "Required"}
            ],
            "documents": [
                {"name": "P&L_KOCH", "status": "missing"},
                {"name": "Cashflow Statement_KOCH", "status": "missing"},
                {"name": "Balance Sheet_KOCH", "status": "verified"}
            ],
            "application_summary": "Koch Industries is applying for an $85 M loan for manufacturing facility upgrades and process automation, requesting a 6-year term at 5.8% fixed interest.",
            "insights_synthesis": "Koch Industries is a well-diversified conglomerate, but the lack of key financial documents prevents completion of the AI risk assessment.",
            "financial_analysis": {
                "summary": "Limited financial visibility due to private entity status. Available data suggests solid cash generation but full assessment pending document submission.",
                "financials": [{"year": "2022", "amount": 115, "operating_margin": 8}, {"year": "2023", "amount": 125, "operating_margin": 9}, {"year": "2024", "amount": 120, "operating_margin": 8}]
            },
            "macro_analysis": {
                "summary": "Diversified manufacturing and industrial conglomerate market analysis",
                "porters_forces": {
                    "buyer_power": {"score": 3, "description": "Moderate - Diversified customer base across industries."},
                    "supplier_power": {"score": 3, "description": "Moderate - Commodity input dependency with hedging capabilities."},
                    "threat_new_entrants": {"score": 2, "description": "Low - Capital-intensive operations with regulatory requirements."},
                    "threat_substitutes": {"score": 2, "description": "Low - Essential industrial products with limited alternatives."},
                    "competitive_rivalry": {"score": 3, "description": "Moderate - Fragmented markets with regional competition."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CL-3673",
            "applicant_name": "The Home Depot",
            "industry": "Retail",
            "loan_amount": 145000000,
            "loan_amount_display": "$145 M",
            "legal_entity_type": "Private",
            "application_stage": "Underwriting",
            "documents_status": "warning",
            "application_status": "On Hold by AI",
            "review_status": "Awaiting Instructions",
            "is_overdue": True,
            "ai_recommendation": {"action": "Hold", "notes": "Cashflow projections inconsistent with historical trends; requires analyst review"},
            "company_insights": [
                "Market position: Leading home improvement retailer with $157B revenue and 2,300+ stores.",
                "Concern: Submitted cash flow projections show unusual patterns inconsistent with 3-year historical data.",
                "Strength: Strong same-store sales growth and professional segment expansion."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 11.2}, {"year": "FY'23", "value": 9.8}, {"year": "FY'24", "value": 8.5}],
                "interest_coverage": [{"year": "FY'22", "value": 14}, {"year": "FY'23", "value": 13}, {"year": "FY'24", "value": 15}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Interest Coverage Ratio", "value": "10.0x"},
                {"metric": "Max. Net Debt/EBITDA", "value": "2.5x"},
                {"metric": "Min. EBITDA Margin", "value": "14%"}
            ],
            "documents": [
                {"name": "P&L_HOME_DEPOT", "status": "verified"},
                {"name": "Cashflow Statement_HOME_DEPOT", "status": "warning"},
                {"name": "Balance Sheet_HOME_DEPOT", "status": "verified"}
            ],
            "application_summary": "The Home Depot is applying for a $145 M loan for store renovation program and supply chain technology investment, requesting an 8-year term at 5.2% fixed interest.",
            "insights_synthesis": "The Home Depot has a strong market position but submitted financial projections require analyst review due to inconsistencies.",
            "financial_analysis": {
                "summary": "Strong retail performance with consistent margins. Cash flow projection anomalies need resolution before proceeding with approval decision.",
                "financials": [{"year": "2022", "amount": 157, "operating_margin": 15}, {"year": "2023", "amount": 153, "operating_margin": 14}, {"year": "2024", "amount": 155, "operating_margin": 14}]
            },
            "macro_analysis": {
                "summary": "Home improvement retail industry dynamics",
                "porters_forces": {
                    "buyer_power": {"score": 3, "description": "Moderate - Consumers have choice but brand loyalty exists."},
                    "supplier_power": {"score": 2, "description": "Low - Large retailer scale provides negotiating leverage."},
                    "threat_new_entrants": {"score": 2, "description": "Low - Significant capital and supply chain investment required."},
                    "threat_substitutes": {"score": 3, "description": "Moderate - Online marketplaces and local contractors compete."},
                    "competitive_rivalry": {"score": 3, "description": "Moderate - Primary competitor Lowe's, with growing online threats."}
                }
            },
            "created_at": now, "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "application_no": "CI-3324",
            "applicant_name": "STO Building Group",
            "industry": "Construction",
            "loan_amount": 12000000,
            "loan_amount_display": "$12 M",
            "legal_entity_type": "Private",
            "application_stage": "Underwriting",
            "documents_status": "verified",
            "application_status": "AI Approved",
            "review_status": "Rejected",
            "is_overdue": False,
            "ai_recommendation": {"action": "Approve Loan", "notes": "Meets lending criteria; recommend standard construction industry covenants"},
            "company_insights": [
                "Niche player: Mid-size construction firm with $2B revenue focused on commercial and institutional projects.",
                "Consistent performance: Steady 8% revenue growth over 3 years with improving margins.",
                "Risk: Cyclical industry exposure and project concentration risk."
            ],
            "key_ratios": {
                "debt_to_equity": [{"year": "FY'22", "value": 0.85}, {"year": "FY'23", "value": 0.78}, {"year": "FY'24", "value": 0.72}],
                "interest_coverage": [{"year": "FY'22", "value": 6.5}, {"year": "FY'23", "value": 7.2}, {"year": "FY'24", "value": 8.1}]
            },
            "covenant_recommendations": [
                {"metric": "Min. Current Ratio", "value": "1.3x"},
                {"metric": "Max. Debt to Equity", "value": "1.0x"},
                {"metric": "Project Bonding Requirement", "value": "Required"}
            ],
            "documents": [
                {"name": "P&L_STO", "status": "verified"},
                {"name": "Cashflow Statement_STO", "status": "verified"},
                {"name": "Balance Sheet_STO", "status": "verified"}
            ],
            "application_summary": "STO Building Group is applying for a $12 M loan for equipment acquisition and working capital for new institutional construction projects, requesting a 3-year term at 6.5% fixed interest.",
            "insights_synthesis": "STO Building Group shows solid operational metrics and improving financials, but the application was rejected by the human reviewer despite AI approval.",
            "financial_analysis": {
                "summary": "Solid mid-market construction company with improving fundamentals. Project backlog provides revenue visibility for the loan term.",
                "financials": [{"year": "2022", "amount": 1.7, "operating_margin": 5}, {"year": "2023", "amount": 1.85, "operating_margin": 6}, {"year": "2024", "amount": 2.0, "operating_margin": 6}]
            },
            "macro_analysis": {
                "summary": "Commercial construction industry analysis",
                "porters_forces": {
                    "buyer_power": {"score": 4, "description": "High - Project-based bidding with price-sensitive clients."},
                    "supplier_power": {"score": 3, "description": "Moderate - Material costs volatile, labor market tight."},
                    "threat_new_entrants": {"score": 3, "description": "Moderate - Lower barriers than other industries but bonding required."},
                    "threat_substitutes": {"score": 1, "description": "Very Low - Physical construction has limited substitutes."},
                    "competitive_rivalry": {"score": 4, "description": "High - Fragmented market with many regional competitors."}
                }
            },
            "created_at": now, "updated_at": now
        }
    ]


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "myridius EVOQ API"}

@api_router.post("/seed")
async def seed_database():
    existing = await db.applications.count_documents({})
    if existing > 0:
        await db.applications.delete_many({})
    apps = get_seed_applications()
    await db.applications.insert_many(apps)
    return {"message": f"Seeded {len(apps)} applications", "count": len(apps)}

@api_router.get("/applications")
async def get_applications(search: Optional[str] = None):
    query = {}
    if search:
        query = {"$or": [
            {"applicant_name": {"$regex": search, "$options": "i"}},
            {"application_no": {"$regex": search, "$options": "i"}},
            {"industry": {"$regex": search, "$options": "i"}}
        ]}
    apps = await db.applications.find(query, {"_id": 0}).to_list(100)

    # Compute stats
    all_apps = await db.applications.find({}, {"_id": 0, "review_status": 1, "is_overdue": 1}).to_list(1000)
    pending = [a for a in all_apps if a.get("review_status") == "Review Pending"]
    awaiting = [a for a in all_apps if a.get("review_status") == "Awaiting Instructions"]
    completed = [a for a in all_apps if a.get("review_status") in ["Approved", "Rejected"]]

    stats = {
        "pending": {"count": len(pending), "overdue": sum(1 for a in pending if a.get("is_overdue"))},
        "awaiting": {"count": len(awaiting), "overdue": sum(1 for a in awaiting if a.get("is_overdue"))},
        "completed": {"count": len(completed), "overdue": sum(1 for a in completed if a.get("is_overdue"))}
    }
    return {"applications": apps, "stats": stats}

@api_router.get("/applications/{application_id}")
async def get_application(application_id: str):
    app = await db.applications.find_one({"id": application_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@api_router.put("/applications/{application_id}/review-status")
async def update_review_status(application_id: str, body: ReviewStatusUpdate):
    result = await db.applications.update_one(
        {"id": application_id},
        {"$set": {"review_status": body.review_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    updated = await db.applications.find_one({"id": application_id}, {"_id": 0})
    return updated

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(body: ChatRequest):
    # Store user message
    user_msg_id = str(uuid.uuid4())
    user_msg = {
        "id": user_msg_id,
        "session_id": body.session_id,
        "application_id": body.application_id,
        "role": "user",
        "content": body.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_messages.insert_one(user_msg)

    # Build context
    system_prompt = "You are an AI underwriting assistant for myridius EVOQ Commercial Lending Workbench. You help commercial lending analysts understand loan applications, financial analysis, risk assessments, and AI agent decisions. Be concise, professional, and data-driven in your responses."

    if body.application_id:
        app_data = await db.applications.find_one({"id": body.application_id}, {"_id": 0})
        if app_data:
            context = json.dumps(app_data, indent=2, default=str)
            system_prompt += f"\n\nYou are currently assisting with the following loan application:\n{context}"

    # Get recent chat history for context
    history = await db.chat_messages.find(
        {"session_id": body.session_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    history.reverse()

    try:
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=body.session_id,
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")

        response_text = await chat.send_message(UserMessage(text=body.message))

        # Store assistant response
        ai_msg_id = str(uuid.uuid4())
        ai_msg = {
            "id": ai_msg_id,
            "session_id": body.session_id,
            "application_id": body.application_id,
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_messages.insert_one(ai_msg)

        return ChatResponse(response=response_text, message_id=ai_msg_id)

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return {"messages": messages}

# ---------- App Setup ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
