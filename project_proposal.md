# AEROENIX - Technical & Financial Proposal
## Hotel Customer Service & Booking Chatbot

**Phase 1 — Pilot · Multi-Channel AI Assistant for Meta Platforms**

### 1. Executive Summary
This proposal sets out Aeroenix's approach, technology, timeline and investment for building an AI-powered customer service and booking chatbot for the client's hotel. The solution responds to guest inquiries across Facebook Messenger, Instagram Direct and WhatsApp, helping guests with hotel information, room types, availability, pricing and booking requests.

Phase 1 is delivered as a controlled pilot on one hotel for 6–8 Weeks, balancing automation with human supervision: the chatbot handles repetitive questions and collects booking details, while staff confirm every booking before the guest receives final confirmation. The architecture is built clean and multi-tenant from day one, so additional hotels can be added in later phases without re-engineering the core.

### 2. Our Understanding of the Requirement
Based on the Business Requirements Document, the key goals for Phase 1 are:
- answering guest questions automatically and 24/7 across the three Meta channels;
- capturing leads and booking inquiries and guiding guests toward a booking;
- reducing staff workload while keeping a human in control of confirmations;
- giving the hotel team a single dashboard to manage conversations, content and reports;
- learning only from staff-approved answers, never inventing hotel-specific information.

### 3. Scope of Work — Phase 1
The Phase 1 delivery includes the following capabilities:
- **Multi-channel integration**: 
- **Channel integration** — Facebook Messenger, Instagram Direct and WhatsApp via the Meta Cloud APIs, with a unified inbox.
- **AI free-text understanding** — natural-language answering grounded in an approved knowledge base (Retrieval-Augmented Generation), with safeguards against incorrect replies.
- **Conversation flows** — FAQ and hotel information, room/availability/price inquiry journeys, and booking-detail collection.
- **Staff-confirmed booking** — the bot prepares the request and routes it to the hotel email/team; staff confirm before the guest receives confirmation.
- **Human takeover** — staff can take over any conversation, pausing the bot, then return it to automated mode.
- **Admin dashboard** — manage FAQs, rooms, prices, offers, availability source, leads, conversation history, suggested answers and a training area.
- **Knowledge base & learning loop** — staff approve new answers, which automatically update the chatbot's knowledge.
- **Multi-hotel structure & Super Admin** — tenant-separated data, settings and channels, with a platform-level Super Admin.
- **Lead scoring & classification** — Hot/Warm/Cold scoring, conversation categorisation, and returning-guest recognition.
- **Reporting & analytics** — conversations, leads, bookings, handovers, mistakes, guest feedback, with Excel/CSV export.
- **Roles & permissions** — Super Admin, Hotel Admin, Reservation Staff and Reception Staff.
- **Data handling & privacy** — guest/conversation data with sensitive ID/passport details excluded from the chatbot, plus staff activity logs.

### 4. Proposed Solution & Technology Stack
Aeroenix recommends a custom build (rather than an off-the-shelf bot platform), because the multi-hotel dashboard, approval-driven knowledge base and per-hotel configuration are difficult to achieve cleanly on closed platforms. The proposed stack:

| Layer | Technology |
|---|---|
| **Channel integration** | Meta Cloud APIs — WhatsApp Business Platform, Messenger Platform, Instagram Graph API |
| **AI / NLU engine** | LLM with Retrieval-Augmented Generation (RAG) over the approved knowledge base |
| **Embeddings & search** | Vector store using Qdrant + MySQL (fewer moving parts, lower cost) |
| **Backend** | Laravel + RESTful API |
| **Admin dashboard** | React (alternatively vue.js) |
| **Database** | MySQL Database; Google Sheets as a temporary data source for room availability and pricing until PMS integration |
| **Notifications** | Email (SMTP) + internal/team notifications |
| **Hosting** | Cloud, managed by the client per the requirements |

### 5. Phase Roadmap
| Phase | Scope | Indicative timing |
|---|---|---|
| **Phase 1 — Pilot** | Pilot chatbot on FB/IG/WhatsApp, AI answers, FAQ & hotel info, booking inquiry collection, staff confirmation, admin dashboard, KB management, human takeover, reporting. | 1.5 - 2 Months |
| **Phase 2 — PMS Integration** | PMS API integration (availability & price), improved booking workflow, reduced manual confirmation where safe, expanded automation. | 1 – 1.5 Months |
| **Phase 3 — Multi-Hotel Rollout** | Roll out to additional hotels; separate dashboard/KB/users/channels per hotel; shared core engine; cross-hotel reporting. | 1 month per hotel |
| **Phase 4 — Future Enhancements** | French support, Voice AI, advanced automation, deeper CRM, optional payment/deposit collection. | Future |

### 6. Timeline
- **6–8 Weeks** to deliver a launch-ready **Phase 1**, including internal testing and deployment on Meta channels (Facebook, Instagram & WhatsApp). 
- **3–4 Weeks** to complete **Phase 2**, including PMS integration, real-time availability & pricing synchronization, booking automation, and AI learning from staff-approved responses. 
- **Approximately 9–12 Weeks** from project kickoff to complete both Phase 1 and Phase 2 (excluding delays caused by third-party PMS providers or API availability).

### 7. Investment
*(Pricing details omitted or handled separately)*

**7.2 Monthly operating costs — single hotel**
| Cost item | Low (USD) | High (USD) |
|---|---|---|
| WhatsApp Business conversation fees | $30 | $150 |
| LLM / AI API usage | $25 | $100 |
| Cloud hosting (app servers) | $30 | $80 |
| Database & managed services | $10 | $50 |
| Email & notifications | $10 | $30 |
| **Total (estimated range / month)** | **$105** | **$410** |

**Assumption:** Approximately 1,000 messages per day (~30,000 messages/month). Actual costs vary depending on token usage and conversation length.

| AI Model | Provider | Estimated Monthly Cost (USD) | Arabic Support |
|---|---|---|---|
| **GPT-4o** | OpenAI | $20 – $60 | Excellent |
| **GPT-4.1** | OpenAI | $60 – $150 | Excellent |
| **Gemini 2.5 Pro** | Google | $20 – $50 | Excellent |
| **Claude Sonnet** | Anthropic | $20 – $70 | Very Good |
| **Qwen 3 (Self-Hosted)** | Alibaba | $150 – $300* | Excellent |
| **Llama 3.3 (Self-Hosted)**| Meta | $150 – $300* | Very Good |

*Note: Self-hosted models do not charge per API request. The estimated monthly cost reflects GPU server hosting and infrastructure.*

### 8. Assumptions
- The hotel team provides approved hotel information and operational rules.
- The current PMS/system is unknown; PMS integration depends on API availability and is planned after the pilot.
- The chatbot is internally tested before going live on Meta platforms.
- Phase 1 does not auto-confirm bookings without staff approval.
- The chatbot learns only from staff-approved responses.
- Each hotel has separate data, dashboard, knowledge base and channel connections.
- The system is hosted and managed by the client.
- The client is responsible for providing all required API credentials, third-party service access, and necessary accounts (e.g., Meta Business, PMS, Email, Cloud Services) required for system integration.

### 9. Out of Scope for Phase 1
- Voice AI.
- Automatic confirmed bookings without staff approval.
- Payment or deposit collection.
- Full PMS integration unless an API is already available and accessible.
- Multi-client SaaS billing and advanced CRM integration.
- Fully autonomous chatbot learning without human approval.

### 10. Open Points to Confirm
A few items in the BRD need a decision before final pricing and the timeline are locked:
1. **Property Management System (PMS)**: Confirm whether a PMS is currently in use and provide API documentation and access credentials (if available). 
2. **Hotel Information**: Provide approved hotel content, including room types, pricing, policies, FAQs, facilities, and promotional offers. 
3. **Meta Business Accounts**: Provide access to WhatsApp Business, Facebook, Instagram, and the required Meta Business credentials. 
4. **Expected Conversation Volume**: Confirm the expected monthly conversation volume to estimate AI operating costs accurately. 
5. **Hosting Environment**: Confirm whether the client will provide the cloud hosting environment or require deployment assistance. 

### 11. Why Aeroenix
Aeroenix builds custom web and mobile applications with a focus on practical, production-ready delivery. We pair modern AI (LLM + RAG) with clean, scalable architecture, and we design human-in-the-loop safeguards so automation never outruns the hotel team's control.

### 12. Next Steps
1. Confirm the open points in Section 10.
2. Hold a short scoping session to finalise scope, pricing and the project plan.
3. Sign off and begin discovery (Month 1).
