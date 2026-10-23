# nipun.space: scraped content

All text rendered by https://www.nipun.space/ on 2026-10-23, captured in Chromium at 1440×900 after each page's animations had settled. Raw JSON: `live/data/content.json`. Each block keeps the site's own line breaks (one rendered text node per line), with the fixed chrome (clock, ticker, status line) stripped. On the projects with several files, `README.md` renders the whole document and each other `.md` file renders one section of it, so their text appears twice. Diagram blocks (React Flow architecture maps, chat flows) come out as their node labels, one per line. The 8 EXPERIMENT projects have no README; their pages show only the fallback line. The text is reproduced only as reference for structure and tone, not for reuse.

## Project cards (/work), 19 in order

| # | Title | Status | Year | Stack line | Blurb | Tags | Image |
|---|---|---|---|---|---|---|---|
| 1 | Uni-Verse | CURRENT | 2026 | Next.js · Supabase | An honest, on-the-record platform for college life. Verified student voices, kept public. | Next.js, Supabase, Realtime | /images/uni-verse.png |
| 2 | Serenity | PRODUCTION | 2025 | Python · React · Docker | Multi-modal mental-health system. Local LLM via Ollama, real-time mood analysis, guided sessions. | LLM/Ollama, React, Docker, FastAPI | /images/Serenity.png |
| 3 | Pragati | PRODUCTION | 2026 | ADK · AlloyDB · Gemini | Self-assembling health intelligence: MCP tools generated at runtime from a live database schema. | MCP, Gemini, AlloyDB, Agents | /images/Pragati.png |
| 4 | Guardia | PRODUCTION | 2026 | YOLOv8-pose · Python · Android | Real-time fall detection for elderly & solo-living safety. Pose estimation + multi-signal heuristics, auto SMS/WhatsApp alerts, 91% accuracy. | YOLOv8, Pose, CV, Android | /images/Guardia.png |
| 5 | Samarth | PRODUCTION | 2025 | Python · FastAPI | NL Q&A over Indian agriculture data; live data.gov.in API + retrieval. Production deploy. | NLP, RAG, FastAPI | /images/Samarth.png |
| 6 | GodProfile | BUILT | 2026 | Python · MCP | MCP server with 16 tools that turns markdown into animated, glassmorphic GitHub profiles. | MCP, Python, Automation | /images/godprofile.png |
| 7 | Smart Notes | BUILT | 2026 | TypeScript | AI-assisted note app focused on fast recall and clean editing. | TypeScript, AI, Notes | /images/Smartnotes.png |
| 8 | StudyPath | BUILT | 2025 | JavaScript | Generates milestone-based learning paths, visualized as an interactive graph. | React, Graph, Full-stack | /images/Studypath.png (lazy, not yet loaded) |
| 9 | Task Manager Pro | BUILT | 2025 | MERN | Full-stack MERN app: JWT auth, real-time updates, normalized data model. | React, Node, MongoDB, JWT | /images/Taskmanager.png (lazy, not yet loaded) |
| 10 | XLNet Emotion | BUILT | 2026 | PyTorch | Fine-tuned XLNet for multi-class emotion classification; structured preprocessing + eval, 87% acc. | NLP, XLNet, PyTorch | /images/xlnet.png (lazy, not yet loaded) |
| 11 | Fake News Classifier | BUILT | 2026 | scikit-learn | Classical NLP baseline: BoW features, LogReg vs Linear SVM with standard metrics. | NLP, SVM, TF-IDF | /images/Fakenews.png (lazy, not yet loaded) |
| 12 | BLIP Captioning | EXPERIMENT | 2025 | Python | BLIP image captioning that parses a URL and captions every image on the page. | CV, BLIP, Transformers | — |
| 13 | AI Audio Analyzer | EXPERIMENT | 2025 | Python | Audio processing and ML-based analysis pipeline. | Audio, ML, DSP | — |
| 14 | IBM GPT Voice | EXPERIMENT | 2025 | JS · Watson | Voice assistant: IBM Watson STT/TTS integrated with a GPT layer. | Speech, Watson, GPT | — |
| 15 | BertQA Bot | EXPERIMENT | 2026 | Python | BERT-based extractive question answering. | NLP, BERT, QA | — |
| 16 | Azure Image Analysis | EXPERIMENT | 2025 | Python · Azure | Image analysis via Azure Cognitive Services. | CV, Azure | — |
| 17 | smarttimer | EXPERIMENT | 2025 | Python · PyPI | Zero-dependency timing utilities: context managers, decorators, memory profiling. | Python, DX, Library | — |
| 18 | NeuroFlow | EXPERIMENT | 2025 | Python | Visualizes simple Python functions (early WIP). | Viz, Python | — |
| 19 | Cat/Dog CNN | EXPERIMENT | 2025 | Python | Convolutional image classifier (cat vs dog). | CV, CNN | — |

## Project detail pages (/work/<slug>)

### /work/serenity

- Title: Serenity — project by Nipun Sujesh
- Files: README.md, features.md, architecture.md, memory.md, crisis.md, chatflow.md, stack.md, api.md, running.md, status.md, links.md
- Header links: live ↗ → https://serenity.nipun.space/; source ↗ → https://github.com/Luc0-0/Serenity-Multi-Modal-Mental-Assistant-System; live demo → serenity.nipun.space → https://serenity.nipun.space/; source → github.com/Luc0-0 → https://github.com/Luc0-0/Serenity-Multi-Modal-Mental-Assistant-System; live demo → serenity.nipun.space → https://serenity.nipun.space/; source → github.com/Luc0-0 → https://github.com/Luc0-0/Serenity-Multi-Modal-Mental-Assistant-System

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×11, svg×18, TABLE×3, PRE×1)

```text
Serenity
A quieter place for your mind.
Serenity is an AI-powered mental-health companion, built as a final-year BTech (AI & Data Science) project. It combines a layered memory system, adaptive personality, real-time emotion detection, and crisis-safe response logic into a single full-stack application, deployed and actively in development.
live demo → serenity.nipun.space
source → github.com/Luc0-0
#
What it does
Most chatbots forget you the moment a conversation ends. Serenity doesn't. Every interaction is stored across four memory tiers (short-term context, semantic vector memory, a 30-day emotional profile, and pattern-based meta-reflections), so the assistant builds a genuine understanding of the user over time.
Alongside memory, it runs a real-time emotion pipeline on every message, adapts its personality to what the user needs in that moment, and routes any input flagged as a crisis through a hardened response path before the LLM ever sees it.
#
Architecture
The system is divided into five layers, each swappable at config level.
REST · SSE
deploy
SQLAlchemy
engines
REACT FRONTEND
Pages
Components
Contexts
API services
FASTAPI BACKEND
Routers
Services
Engines
Tasks
INFRASTRUCTURE
Docker
Vercel
Railway
Supabase
POSTGRESQL
10 tables
Alembic
asyncpg
AI / ML LAYER
Keyword ~65%
XLNet ~88%
Ollama Cloud
hover a layer · drag nodes to rearrange
Frontend	React 19 SPA (Vite, CSS Modules, Framer Motion, GSAP)
Backend	FastAPI, async SQLAlchemy 2.0, pluggable Emotion / LLM / Crisis engines
Database	PostgreSQL 15 (Supabase), 10 tables, Alembic
AI / ML	keyword (~65%) + XLNet (~88%) emotion, Ollama Cloud LLM with fallback
Infra	Docker Compose dev; Vercel + Railway + Supabase prod
#
Memory System
The core technical contribution. Each chat message triggers a four-tier memory bundle before the LLM prompt is assembled.
Short-term	Cached conversation summaries (session)
Semantic	384-dim vector similarity search (sentence-transformers)
Emotional Profile	30-day rolling aggregation (12h cache)
Meta-Reflections	Journal + conversation pattern synthesis (2d cache)
The LLM receives all four tiers as structured context, so responses reference past states, recurring themes and long-term patterns, not just the last few messages.
#
Crisis Detection
Crisis assessment runs first, before any LLM call. A conservative keyword engine (high precision over recall) classifies severity and returns resources (988, 741741, 911) on trigger; the turn terminates there and nothing reaches the LLM. Events are logged with severity and keywords.
#
Chat Flow
1
User Input
CheckIn · ChatContext · api.js validation
2
POST /api/chat
FastAPI router · JWT · Pydantic schema
3
Crisis Assessmentcritical
keyword match · severity · critical path
└─ if crisis →
988 · 741741 · 911 · stop
4
ConversationService
create / validate · save user message
5
EmotionService
keyword engine → XLNet · label + confidence
6
ContextManager
history · truncation · summarisation
7
MemoryService
4-tier bundle: short · semantic · emotional · meta
8
LLMService
adaptive prompt · Ollama Cloud
9
Save → DB
messages · role · conversation_id
10
Background Tasks
title · analytics · journal · memory
11
Return → Frontend
JSON · crisis flag · resources
12
Typewriter Display
character-by-character
Input → crisis check → ConversationService → EmotionService → ContextManager → 4-tier memory bundle → LLM prompt → Ollama → save → background tasks → typewriter display.
#
Tech Stack
Frontend
React 19
Vite 7
Framer Motion
GSAP
Backend
Python
FastAPI
◦
SQLAlchemy 2.0
Database
PostgreSQL 15
Supabase
AI / ML
XLNet / PyTorch
◦
Ollama Cloud
Auth & Deploy
JWT
Docker
Vercel
Railway
#
Feature Status
ALL
IMPLEMENTED
IN PROGRESS
PLANNED
11/29 shipped
IMPLEMENTED
Streaming chat (SSE)
Conversation history
Auto title generation
Typewriter display
Shapeshifter personality (4 modes)
Pluggable engine architecture
Four-tier memory
Crisis detection
Journal + AI extraction
Emotion analytics
JWT auth · Docker deploy
IN PROGRESS
XLNet as default engine
Ollama emotion detection
Improved context window
Pattern-based crisis (ML)
Meditation feature
Emotion picker (6-level UI)
Mobile polish
Rate limiting
Emotional trend graph
PLANNED
Voice input & emotion
Facial expression analysis
Predictive crisis detection
Fine-tuned mental-health LLM
Native mobile (React Native)
Wearable integration
Therapist portal
Multi-language
E2E encryption · HIPAA
Shipped: real-time streaming chat, four-mode personality, four-tier memory, crisis detection, journal + analytics, JWT auth, Docker deploy. In progress: XLNet as the default emotion engine, the Insights visualisations, and mobile polish. Planned: voice input, wearable integration, and a therapist portal.
#
Running Locally
Prerequisites: Docker and Docker Compose.
git clone https://github.com/Luc0-0/Serenity-Multi-Modal-Mental-Assistant-System
cd Serenity-Multi-Modal-Mental-Assistant-System
cp backend/.env.example backend/.env
docker-compose up --build
#
API
POST /api/auth/signup	Register
POST /api/auth/login	Login, returns JWT
POST /api/chat	Send message, returns AI response
GET /api/conversations	List user conversations
GET /api/emotions/analytics	Emotion trend data
GET /api/journal	Journal entries
POST /api/journal	Create journal entry
GET /health	Health check
#
Status
Deployed and functional, actively in development. License: AGPL-3.0.
#
Links
live demo → serenity.nipun.space
source → github.com/Luc0-0
```

#### features.md (elements: H2×1, UL×1)

```text
#
What it does
Most chatbots forget you the moment a conversation ends. Serenity doesn't. Every interaction is stored across four memory tiers, so the assistant builds a genuine understanding of the user over time rather than starting cold each session.
–
Four-tier memory: short-term context, semantic vector memory, a 30-day emotional profile, and pattern-based meta-reflections
–
Real-time emotion pipeline that runs on every message
–
Adaptive personality (four modes) that shifts to what the user needs in the moment
–
Crisis inputs routed through a hardened response path before the LLM ever sees them
–
Journal with AI extraction, emotion analytics dashboard, streaming (SSE) chat
```

#### architecture.md (elements: H2×1, svg×5, TABLE×1)

```text
#
Architecture
The system is divided into five layers. Each is swappable at config level, so engines can be replaced without touching service code.
REST · SSE
deploy
SQLAlchemy
engines
REACT FRONTEND
Pages
Components
Contexts
API services
FASTAPI BACKEND
Routers
Services
Engines
Tasks
INFRASTRUCTURE
Docker
Vercel
Railway
Supabase
POSTGRESQL
10 tables
Alembic
asyncpg
AI / ML LAYER
Keyword ~65%
XLNet ~88%
Ollama Cloud
hover a layer · drag nodes to rearrange
Frontend	React 19 SPA with Vite, CSS Modules, Framer Motion and GSAP. Pages: CheckIn (chat), Journal, Insights, Meditate, Profile. State via context providers with localStorage persistence.
Backend	FastAPI with async SQLAlchemy 2.0. AI logic lives in a pluggable engine system (EmotionEngine, LLMEngine, CrisisEngine), swappable at config level. Background tasks run non-blocking via FastAPI BackgroundTasks.
Database	PostgreSQL 15 on Supabase. 10 tables: users, conversations, messages, emotion logs, journal entries, crisis events, semantic memories, emotional profiles, meta-reflections, context cache. Migrations via Alembic.
AI / ML	Keyword emotion engine (~65%, no GPU). Optional XLNet (~88%) and Ollama-based detection are pluggable. LLM via Ollama Cloud (gpt-oss:120b) with a template fallback chain.
Infrastructure	Docker Compose for local dev. Production across Vercel (frontend), Railway (backend), Supabase (PostgreSQL).
```

#### memory.md (elements: H2×1, TABLE×1)

```text
#
Memory System
The core technical contribution. Each chat message triggers a four-tier memory bundle before the LLM prompt is assembled.
Short-term	Cached conversation summaries (session TTL)
Semantic	384-dim vector similarity search via sentence-transformers
Emotional Profile	30-day rolling emotion aggregation (12h cache)
Meta-Reflections	Journal + conversation pattern synthesis (2d cache)
The LLM receives all four tiers as structured context, allowing responses that reference past emotional states, recurring themes and long-term patterns, not just the last few messages.
```

#### crisis.md (elements: H2×1)

```text
#
Crisis Detection
Crisis assessment runs as the first step in every request, before any LLM call. It uses a keyword-based engine, intentionally conservative (high precision over recall), that classifies severity.
If triggered, it immediately returns appropriate resources (988, 741741, 911) and the conversation terminates at that point; no LLM response is generated. Crisis events are logged to a dedicated table with severity, detected keywords and acknowledgement state.
```

#### chatflow.md (elements: H2×1, UL×1)

```text
#
Chat Flow
1
User Input
CheckIn · ChatContext · api.js validation
2
POST /api/chat
FastAPI router · JWT · Pydantic schema
3
Crisis Assessmentcritical
keyword match · severity · critical path
└─ if crisis →
988 · 741741 · 911 · stop
4
ConversationService
create / validate · save user message
5
EmotionService
keyword engine → XLNet · label + confidence
6
ContextManager
history · truncation · summarisation
7
MemoryService
4-tier bundle: short · semantic · emotional · meta
8
LLMService
adaptive prompt · Ollama Cloud
9
Save → DB
messages · role · conversation_id
10
Background Tasks
title · analytics · journal · memory
11
Return → Frontend
JSON · crisis flag · resources
12
Typewriter Display
character-by-character
Full pipeline, from user input to the typewriter display:
–
User input (CheckIn, ChatContext, api.js validation)
–
Crisis assessment (keyword match, severity, critical path)
–
ConversationService, then EmotionService (keyword engine, optional XLNet)
–
ContextManager assembles the 4-tier memory bundle
–
LLM prompt assembly → Ollama Cloud
–
Save to DB → non-blocking background tasks → typewriter display
```

#### stack.md (elements: H2×1, svg×13)

```text
#
Tech Stack
Frontend
React 19
Vite 7
Framer Motion
GSAP
Backend
Python
FastAPI
◦
SQLAlchemy 2.0
Database
PostgreSQL 15
Supabase
AI / ML
XLNet / PyTorch
◦
Ollama Cloud
Auth & Deploy
JWT
Docker
Vercel
Railway
```

#### api.md (elements: H2×1, TABLE×1)

```text
#
API Endpoints
REST endpoints exposed by the FastAPI backend.
POST /api/auth/signup	Register
POST /api/auth/login	Login, returns JWT
POST /api/chat	Send message, returns AI response
GET /api/conversations	List user conversations
GET /api/emotions/analytics	Emotion trend data
GET /api/journal	Journal entries
POST /api/journal	Create journal entry
GET /health	Health check
```

#### running.md (elements: H2×1, PRE×3)

```text
#
Running Locally
Prerequisites: Docker and Docker Compose.
git clone https://github.com/Luc0-0/Serenity-Multi-Modal-Mental-Assistant-System
cd Serenity-Multi-Modal-Mental-Assistant-System
Copy the environment file and fill in your values:
cp backend/.env.example backend/.env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/serenity
SECRET_KEY=your-secret-key
OLLAMA_API_KEY=your-ollama-api-key
OLLAMA_BASE_URL=https://ollama.com/v1
Start all services, then run migrations:
docker-compose up --build
docker exec -it serenity-backend alembic upgrade head
```

#### status.md (elements: H2×1, UL×1)

```text
#
Feature Status
ALL
IMPLEMENTED
IN PROGRESS
PLANNED
11/29 shipped
IMPLEMENTED
Streaming chat (SSE)
Conversation history
Auto title generation
Typewriter display
Shapeshifter personality (4 modes)
Pluggable engine architecture
Four-tier memory
Crisis detection
Journal + AI extraction
Emotion analytics
JWT auth · Docker deploy
IN PROGRESS
XLNet as default engine
Ollama emotion detection
Improved context window
Pattern-based crisis (ML)
Meditation feature
Emotion picker (6-level UI)
Mobile polish
Rate limiting
Emotional trend graph
PLANNED
Voice input & emotion
Facial expression analysis
Predictive crisis detection
Fine-tuned mental-health LLM
Native mobile (React Native)
Wearable integration
Therapist portal
Multi-language
E2E encryption · HIPAA
Deployed and functional, actively in development.
–
Shipped: streaming chat, four-mode personality, four-tier memory, crisis detection, journal + analytics, JWT auth, Docker deploy
–
In progress: XLNet as default emotion engine, Insights visualisations, mobile polish
–
Planned: voice input, wearable integration, therapist portal, multi-language
```

#### links.md (elements: H2×1)

```text
#
Links
live demo → serenity.nipun.space
source → github.com/Luc0-0
```

### /work/pragati

- Title: Pragati — project by Nipun Sujesh
- Files: README.md, architecture.md, boot-flow.md, links.md
- Header links: live ↗ → https://pragati-366193575719.us-central1.run.app/; source ↗ → https://github.com/Luc0-0/pragati; live demo ↗ → https://pragati-366193575719.us-central1.run.app/; source ↗ → https://github.com/Luc0-0/pragati

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×3, UL×1, svg×2)

```text
Pragati
India's self-assembling public-health intelligence system.
PRAGATI (Progressive Reasoning Agent for Global Advanced Total Intelligence), built for the Google Gen AI Academy APAC hackathon, Track 1: AI Agents with ADK.
live demo ↗
source ↗
#
What makes it unique
Most AI agents are hand-coded with fixed tools. PRAGATI self-assembles its own MCP tools at runtime. Add a table to AlloyDB, restart, and it has a new tool, with zero code changes.
#
How it boots
–
Cartographer introspects the AlloyDB schema, no hardcoded table names
–
Forge generates MCP Toolbox tool definitions from the discovered schema
–
Root Orchestrator (ADK agent) routes natural-language queries to the right tool
–
Gemini Flash synthesizes a natural-language answer from the raw data
#
Tech Stack
AI
Gemini Flash
Python
Agents & Data
◦
Google ADK
◦
AlloyDB
◦
MCP Toolbox
Deploy
◦
Cloud Run
```

#### architecture.md (elements: H2×1, svg×8)

```text
#
Architecture
At boot, the orchestrator wires its own tools from the live database schema, then routes each query to the right one.
NL
introspect
generates
data
USER QUERY
natural language
ROOT ORCHESTRATOR
Google ADK
routing
CARTOGRAPHER
schema introspect
FORGE
MCP tool gen
ALLOYDB
live schema
queries
MCP REGISTRY
self-assembled
GEMINI FLASH
NL synthesis
hover a layer · drag nodes to rearrange
```

#### boot-flow.md (elements: H2×1)

```text
#
Boot Flow
Each query flows through the self-assembled agent pipeline:
1
User query
natural language
2
Root Orchestrator
Google ADK · routing
3
Cartographer
introspect AlloyDB schema
4
Forge
generate MCP tools from schema
5
MCP Registry
self-assembled tools
6
Query AlloyDB
via the selected tool
7
Gemini Flash
synthesize NL answer
```

#### links.md (elements: H2×1)

```text
#
Links
live demo ↗
source ↗
```

### /work/guardia

- Title: Guardia — project by Nipun Sujesh
- Files: README.md, how-it-works.md, pipeline.md, results.md, links.md
- Header links: source ↗ → https://github.com/kripasekar187-bit/guardia_final-year; source ↗ → https://github.com/kripasekar187-bit/guardia_final-year

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×2, UL×1, svg×2)

```text
Guardia
Real-time fall detection for elderly and solo-living safety.
Guardia watches over people who live alone using pose estimation and acts fast when something goes wrong. A final-year project.
source ↗
#
What it does
–
Runs on a standard webcam, processing video in real time
–
On a fall: speaks an "Are you okay?" prompt, then an alarm if there's no response
–
Sends SMS and WhatsApp alerts to an emergency contact
–
Uploads a snapshot of the fall to cloud storage
–
Fall to SMS delivery in about 12 seconds
#
Tech Stack
Vision
Python
◦
YOLOv8-pose
App
Android
◦
Kotlin / Java
```

#### how-it-works.md (elements: H2×1, UL×1)

```text
#
How it works
Built on YOLOv8n-pose (pre-trained skeleton detection) with multi-signal heuristics layered on top, rather than a custom model.
–
Velocity spike: sudden downward acceleration of the body centre
–
Horizontal posture: bounding-box aspect ratio flips when someone falls
–
Spine angle: skeleton orientation crosses toward horizontal
–
A fall is flagged only when 2 of the 3 signals trigger, cutting false positives
–
Per-person tracking, a 3.5s grace period, and a raise-hand self-cancel
```

#### pipeline.md (elements: H2×1)

```text
#
Detection Pipeline
From a webcam frame to an alert:
1
Webcam frame
real-time video
2
YOLOv8-pose
skeleton keypoints
3
Signals
velocity · posture · spine angle
4
Fall flaggedcritical
if 2 of 3 signals trigger
└─ if crisis →
988 · 741741 · 911 · stop
5
Grace period
3.5s · raise hand to cancel
6
Voice + alarm
"Are you okay?" then alarm
7
Alert
SMS + WhatsApp to contact
8
Snapshot
upload to cloud
```

#### results.md (elements: H2×1, TABLE×1)

```text
#
Results
Tested on 75 clips across 7 categories with 3 subjects.
Accuracy	91.0%
Test set	75 clips · 7 categories · 3 subjects
Latency	~12s fall to SMS
```

#### links.md (elements: H2×1)

```text
#
Links
source ↗
```

### /work/samarth

- Title: Samarth — project by Nipun Sujesh
- Files: README.md, architecture.md, data.md, running.md, links.md
- Header links: live ↗ → https://samarth-two.vercel.app/; source ↗ → https://github.com/Luc0-0/Samarth; live demo ↗ → https://samarth-two.vercel.app/; source ↗ → https://github.com/Luc0-0/Samarth

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×2, UL×1, svg×6)

```text
Samarth
Intelligent Q&A for Indian agriculture.
Samarth answers natural-language questions over Indian agriculture data, with live data.gov.in API integration, a Next.js frontend, and cloud deployment.
live demo ↗
source ↗
#
What you can ask
–
Live: current crop prices in Maharashtra, latest mandi rates for wheat
–
Historical (2001-2014): rainfall comparisons, rice production by state, cotton trends
–
Analytical: correlation between rainfall and crop production
#
Tech Stack
Frontend
Next.js
Tailwind
Backend
Python
FastAPI
Deploy
Vercel
◦
Render
Docker
```

#### architecture.md (elements: H2×1, svg×4)

```text
#
Architecture
A natural-language question is parsed, then routed to live or historical data before an answer is composed.
query
live
history
NEXT.JS FRONTEND
Q&A UI
FASTAPI BACKEND
NLP
routing
data.gov.in API
live mandi rates
HISTORICAL DATA
2001-2014
hover a layer · drag nodes to rearrange
```

#### data.md (elements: H2×1)

```text
#
Data sources
Live market rates via the data.gov.in API, plus a historical dataset (2001-2014) for trends and correlations.
```

#### running.md (elements: H2×1, PRE×1)

```text
#
Running
docker-compose up --build
# frontend :3000  ·  backend :8000
# local
python run_server.py
cd frontend/nextjs && npm install && npm run dev
```

#### links.md (elements: H2×1)

```text
#
Links
live demo ↗
source ↗
```

### /work/godprofile

- Title: GodProfile — project by Nipun Sujesh
- Files: README.md
- Header links: live ↗ → https://luc0-0.github.io/GodProfile/; source ↗ → https://github.com/Luc0-0/GodProfile; live demo ↗ → https://luc0-0.github.io/GodProfile/; source ↗ → https://github.com/Luc0-0/GodProfile

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×3, UL×1, PRE×1, svg×1)

```text
GodProfile
Turns your GitHub profile README into a god-tier art exhibit.
GodProfile is an MCP server (published on PyPI) that ships 16 tools to generate glassmorphic SVGs, animated banners, live-data widgets, bento-grid layouts, and full GitHub Actions CI, all from a single MCP config line. Every visual in its own README was generated by GodProfile itself.
live demo ↗
source ↗
#
What it does
–
16 MCP tools for profile art: animated terminals, banners, glassmorphic cards, bento grids, live widgets
–
4 built-in themes
–
One-line MCP config for Claude Desktop
–
Generates GitHub Actions CI to keep the live widgets fresh
#
Install
pip install godprofile-mcp
#
Tech Stack
Core
Python
◦
MCP Protocol
◦
PyPI
```

### /work/smart-notes

- Title: Smart Notes — project by Nipun Sujesh
- Files: README.md
- Header links: source ↗ → https://github.com/Luc0-0/Smart-notes-by-Nipun; source ↗ → https://github.com/Luc0-0/Smart-notes-by-Nipun

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×3, UL×2, svg×5)

```text
Smart Notes
An intelligent note-taking app.
Elevated Notes is a feature-rich note app built with Next.js, Firebase, and Google's Gemini via Genkit, for capturing thoughts, organizing projects, and enhancing writing with AI tools.
source ↗
#
AI features
–
Summarize long notes
–
Generate outlines from a title
–
Rewrite for clarity and style
–
Adjust tone
–
Extract action items from meetings
–
AI note starters from a prompt
–
Auto-tagging on save
#
Organization
–
Specialized notebooks: General, Projects, Meetings, Personal
–
Custom tags and browse-by-tag
–
Full-text client-side search
–
Archiving with restore
#
Tech Stack
Frontend
Next.js
React
Tailwind
AI
Gemini (Genkit)
Backend
Firebase
```

### /work/studypath

- Title: StudyPath — project by Nipun Sujesh
- Files: README.md
- Header links: source ↗ → https://github.com/Luc0-0/StudyPath; source ↗ → https://github.com/Luc0-0/StudyPath

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×2, UL×1, svg×6)

```text
StudyPath
Personalized learning roadmaps as interactive graphs.
StudyPath.ai generates structured learning plans with milestones and subtopics, visualized as interactive dependency graphs.
source ↗
#
Features
–
Structured learning plans with milestones and subtopics
–
Interactive dependency-graph visualization (ReactFlow)
–
Real-time form validation and error handling
–
Rate-limited, CORS-protected API
–
Optional PostgreSQL persistence for saved plans
–
Responsive across desktop and tablet
#
Tech Stack
Frontend
React 18
Vite
Tailwind
◦
ReactFlow
Backend
Python
FastAPI
PostgreSQL
```

### /work/task-manager-pro

- Title: Task Manager Pro — project by Nipun Sujesh
- Files: README.md
- Header links: live ↗ → https://task-manager-pro-are3-drab.vercel.app/; source ↗ → https://github.com/Luc0-0/Task-manager-pro; live demo ↗ → https://task-manager-pro-are3-drab.vercel.app/; source ↗ → https://github.com/Luc0-0/Task-manager-pro

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×2, UL×1, svg×9)

```text
Task Manager Pro
Production-ready full-stack task manager.
A comprehensive task-management app built with React, Node.js, and MongoDB, with real-time collaboration, AI task creation, gamification, and analytics.
live demo ↗
source ↗
#
Features
–
Core: JWT + Google OAuth, task CRUD, projects, tags + filtering, reminders
–
Intermediate: subtasks + dependencies, recurring tasks, calendar drag-and-drop, smart search, progress tracking
–
Advanced: natural-language AI task creation, real-time collaboration (WebSocket), gamification (XP / levels), analytics dashboard, team sharing
#
Tech Stack
Frontend
React 18
Vite
Tailwind
Redux Toolkit
Framer Motion
Socket.io
Backend
Node.js
MongoDB
JWT
```

### /work/xlnet-emotion

- Title: XLNet Emotion — project by Nipun Sujesh
- Files: README.md
- Header links: source ↗ → https://github.com/Luc0-0/xlnet-emotion-classifier; source ↗ → https://github.com/Luc0-0/xlnet-emotion-classifier

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×3, TABLE×1, PRE×1, UL×1)

```text
XLNet Emotion
Fine-tuned XLNet for emotion classification.
Classifies social-media text into four emotions (anger, fear, joy, sadness). XLNet-base-cased, fine-tuned for sequence classification.
source ↗
#
Results
Accuracy	87%
Weighted F1	0.87
Dataset	7,102 train · 347 val · 3,142 test
#
Usage
from xlnet_emotion.inference import EmotionPredictor
predictor = EmotionPredictor(model, "xlnet-base-cased")
result = predictor.predict("This is amazing!")
# {"label": "joy", "confidence": 0.94}
#
Training
–
XLNet-base-cased, sequence classification
–
AdamW, learning rate 2e-5, batch size 8
–
Preprocessing removes @mentions and #hashtags
```

### /work/fake-news-classifier

- Title: Fake News Classifier — project by Nipun Sujesh
- Files: README.md
- Header links: source ↗ → https://github.com/Luc0-0/fake-news-classification-nlp; source ↗ → https://github.com/Luc0-0/fake-news-classification-nlp

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×2, UL×1)

```text
Fake News Classifier
Fake-news detection with classical NLP.
A clear, interpretable pipeline for binary fake-vs-factual news classification using classical NLP and linear models, focused on fundamentals over complex architectures.
source ↗
#
Pipeline
–
Text preprocessing
–
Feature extraction: Bag-of-Words / TF-IDF
–
Linear classifiers: Logistic Regression vs Linear SVM
–
Standard evaluation metrics
#
Dataset
News articles with title, text, date, and a fake/factual label. A 70/30 train-test split.
```

### /work/uni-verse

- Title: Uni-Verse — project by Nipun Sujesh
- Files: README.md
- Header links: live ↗ → https://uni-verse.co.in/; live ↗ uni-verse.co.in → https://uni-verse.co.in/

#### README.md (elements: H1×1, BLOCKQUOTE×1, H2×1)

```text
Uni-Verse
An honest, on-the-record platform for college life.
Uni-Verse is what I'm building now: verified student voices about colleges, kept public and on the record. Actively in development.
live ↗ uni-verse.co.in
#
Status
Currently building. More detail as it ships.
```

### /work/blip-captioning

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/ai-audio-analyzer

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/ibm-gpt-voice

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/bertqa-bot

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/azure-image-analysis

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/smarttimer

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/neuroflow

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

### /work/cat-dog-cnn

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Files: none (fallback page)
- Header links: —

> No detailed readme wired for this one yet. · ← back to /projects

## Posts (/writing/<slug>)

### /writing/four-tier-memory

- Title: Giving an AI assistant a memory that doesn't rot — Nipun Sujesh

```text
← cd ~/writing
14 May 2026
·
2 min read
ai
serenity
architecture
Giving an AI assistant a memory that doesn't rot
Most AI assistants have the memory of a goldfish with a notebook. They either remember nothing past the context window, or they dump every message into a vector store and call it memory. I tried the second approach first. It rots.
Serenity is a mental health assistant I built as my capstone. In that domain, memory is not a nice-to-have. If someone tells you on Monday that exams are crushing them, and on Thursday you ask how work is going, you have lost them. Worse, you might have hurt them.
## Why one vector store fails
Naive retrieval treats every memory as equal. It isn't. What someone said ten minutes ago, what they said last week, what stays true about them, and what you concluded across many sessions are four different kinds of information. Stuffing them into one index gives you noise dressed up as recall.
So Serenity runs four tiers. Working memory holds the live conversation. Session memory summarizes each conversation once it ends. Long-term memory holds durable facts: triggers, preferences, patterns. And insight memory holds conclusions the system forms slowly, across sessions. Each tier has its own write rules, its own decay, and its own retrieval weight.
## The part that surprised me
The hard part was not retrieval. It was deciding what gets to be remembered. Everything cannot be a memory or nothing is. Session summaries go through a filter that asks a blunt question: would a good therapist write this down? Most of a conversation does not survive that question.
For the emotion layer, I fine-tuned XLM-RoBERTa on conversational data. It reached 81.3% emotion classification accuracy at around 680 ms median response. The crisis detection pipeline hit 95% safety recall, which was the number I actually cared about. Missing a crisis is not an acceptable failure mode, so the system is tuned to be paranoid there and casual everywhere else.
The paper on this is submitted to ICRAIA 2025. The live build is at serenity.nipun.space. It is not perfect. But it remembers Thursday what you told it Monday, and it turns out that alone puts you ahead of most of the field.
— Nipun · nipun.space
```

### /writing/why-uni-verse

- Title: Why I'm building Uni-Verse — Nipun Sujesh

```text
← cd ~/writing
02 June 2026
·
2 min read
uni-verse
building
Why I'm building Uni-Verse
Every year, lakhs of students in India pick a college based on ads, paid rankings, and a campus tour that was staged down to the flower pots. Then the fees are paid, and they find out what the place is actually like. By then it is too late to matter.
I am a final-year student. I watched this happen around me, and to me. The information students needed existed the whole time. It lived in senior group chats, hostel corridors, and late-night conversations. It just never sat anywhere out in the open, anywhere a college could not pay to bury it.
## The honest record
Uni-Verse is my answer: an honest record of what India's colleges are actually like, written by verified students living there. Think Glassdoor, but for campuses. What a college advertises sits next to what its own students report. One of those can be bought. The other cannot.
The whole platform runs on one rule: anonymous, but verified. You prove you study there with your college identity. Then that identity is locked away, and nothing you post can be traced back to you. Not by your college, not by other students, not by me.
## Why anonymity alone always dies
Yik Yak, Secret, Sarahah. Every anonymous app dies the same death, because anonymity without proof is just noise with a mask on. Uni-Verse flips the order. Prove you belong first. Then disappear. What remains is a record where every voice is real and no voice is exposed.
There is also a score. The Verity Score, zero to a thousand, computed from verified student reports and how a college responds to them. A college cannot buy it up. They can only earn it. That is the point.
The landing page is live at uni-verse.co.in and the waitlist is open. I am collecting the first thousand students, the Founding Voices, before full rollout. If you are a student in India, that spot is yours to claim.
— Nipun · nipun.space
```

### /writing/agents-that-build-their-own-tools

- Title: Agents that build their own tools — Nipun Sujesh

```text
← cd ~/writing
20 April 2026
·
2 min read
agents
gcp
pragati
Agents that build their own tools
The standard way to build an agent looks like this: you write ten tool definitions by hand, wire them to functions, and pray the model picks the right one. It works. It also means every schema change is a code change, and your agent only knows what you remembered to teach it.
For the Google Gen AI Academy hackathon, I wanted to see how far the opposite approach could go. PRAGATI ships with zero hardcoded tools.
## How it works
A Root Orchestrator agent connects to AlloyDB and introspects the schema at runtime. Tables, columns, types, relationships. From that, it generates MCP tool definitions on the fly, registers them, and routes natural language queries to tools that did not exist a second earlier. Change the database and the toolset changes with it. No redeploy.
›
Google ADK for the agent framework
›
MCP Toolbox for dynamic tool generation
›
AlloyDB with pgvector for storage and similarity search
›
Gemini Flash on Vertex AI for the reasoning layer
›
FastAPI and Docker on Cloud Run for serving
We ran it over 7,894 rows of public health data. Ask it something in plain English and you can watch it decide which tool it needs, notice the tool does not exist, build it, and then use it. The first time that loop closed end to end, I sat there grinning at a terminal for a solid minute.
## What I took away
Dynamic tooling is not free. You trade compile-time safety for runtime flexibility, so validation and guardrails have to move into the loop. The agent needs to check its own generated tools before trusting them, which feels strange to write and stranger to debug.
But the direction feels right. MCP gives tools a standard shape, and once tools have a standard shape, generating them stops being exotic. I think a lot of agent infrastructure ends up here: less hand-wiring, more systems that read their environment and assemble what they need. PRAGATI is on GitHub if you want to dig through it.
— Nipun · nipun.space
```

### /writing/rag-with-a-job

- Title: What RAG looks like once it has a job — Nipun Sujesh

```text
← cd ~/writing
18 June 2026
·
2 min read
rag
llm
work
What RAG looks like once it has a job
Building a RAG demo takes an afternoon. Embed some documents, wire up retrieval, pass chunks to a model. It answers questions and everyone claps. Then you give it a real job, where real people act on its answers every day, and a different project begins.
I spend my days building LLM and RAG powered workflow automation at an AI company. Most of what I have learned is not in the tutorials.
## Retrieval is the product
When a RAG system is wrong, the model usually is not the problem. Retrieval is. Garbage chunks in, confident nonsense out. The unglamorous work is upstream: how documents get split, what metadata rides along with each chunk, when to filter before searching instead of after. Chunking strategy affects answer quality more than model choice. Nobody wants to hear that, because chunking is boring. It is also the job.
## Evals before vibes
In a demo you check five answers by eye and ship. In production you need a set of questions with known answers, run on every change. Not hundreds to start. Even twenty good ones catch most regressions. Without them, every prompt tweak is a coin flip you cannot see landing.
## Boring beats clever
My rule now: the automation that survives is the one a non-engineer can trust without understanding. That means predictable failure modes, answers that cite where they came from, and a system that says it does not know instead of improvising. A slightly dumber pipeline that fails loudly beats a clever one that fails quietly. Every time.
None of this is glamorous. All of it is the difference between a demo and a tool people rely on. If you are taking RAG to production, spend your effort in this order: retrieval quality, evals, failure behavior, and only then the model.
— Nipun · nipun.space
```

### /writing/mcp-became-the-plug

- Title: MCP quietly became the plug — Nipun Sujesh

```text
← cd ~/writing
08 March 2026
·
2 min read
mcp
agents
opinion
MCP quietly became the plug
Two years ago, connecting an LLM to your tools meant picking a framework and marrying it. Every integration was bespoke. Your database connector worked in one stack and nowhere else, and switching frameworks meant rewriting everything that touched the outside world.
Then the Model Context Protocol showed up and did something unfashionable. It did not try to be an agent framework, an orchestrator, or a platform. It just standardized the plug: a common shape for how a model discovers tools, calls them, and reads what comes back.
## Boring is a strategy
USB did not win because it was exciting. It won because it ended the drawer full of proprietary cables. MCP is doing the same thing for AI tooling. Write a server once, and any MCP-speaking client can use it. The connector outlives the framework you happened to write it in, which quietly changes where the value sits.
I feel this daily. On PRAGATI, my agent generates MCP tool definitions at runtime, which is only possible because tools have a standard shape to generate into. At work, connectors we build are useful beyond the stack they were born in. And half my own development setup is MCP servers talking to coding agents.
## Where I think this goes
Frameworks will keep churning. Standards stick around. My bet is that in a few years nobody remembers which agent framework you used in 2025, the same way nobody asks which HTTP library a website was built with. The interesting question moves up a level: what tools does your system expose, and how well do they compose.
If you are building anything agent-shaped, expose your capability as an MCP server first and integrate frameworks second. The cable drawer is closed. Good riddance.
— Nipun · nipun.space
```

## Section pages

### /

- Title: Nipun Sujesh — AI Engineer · Terminal Portfolio
- Meta description: Terminal portfolio of an AI engineer building production AI end to end: RAG pipelines, agentic systems, full-stack apps. Ask LucBot, the site's built-in RAG assistant.
- Canonical: https://www.nipun.space/
- Images: /images/overlay.png (1536x1024, alt=""); /images/nipun.png (1023x1537, alt=""); /images/nipun.png (1023x1537, alt="Nipun Sujesh")
- Links: Uni-Verse -> https://uni-verse.co.in

```text
›
AI engineer building production AI systems and the full-stack around them.
Currently building
Uni-Verse
, an on-the-record platform for college life.
PROJECTS SHIPPED
12+
AI APPLICATIONS
8+
CURRENT
Uni-Verse
YEARS CODING
4+
SYSTEM
CPU
MEM
DISK
NET
42 KB/s
FOCUS
AI
×
FULL STACK
PRODUCTS
×
SYSTEMS
LEARNING
×
SHIPPING
⌃
⌄
skills
home
services
work
writing
about
contact
SCROLL · CLICK
```

### /work

- Title: Projects — Nipun Sujesh
- Images: /images/overlay.png (1536x1024, alt=""); /images/uni-verse.png (900x1125, alt="Uni-Verse"); /images/Serenity.png (1122x1402, alt="Serenity"); /images/Pragati.png (1122x1402, alt="Pragati"); /images/Guardia.png (1003x1568, alt="Guardia"); /images/Samarth.png (1122x1402, alt="Samarth"); /images/godprofile.png (1003x1568, alt="GodProfile"); /images/Smartnotes.png (1003x1568, alt="Smart Notes"); /images/Studypath.png (0x0, alt="StudyPath"); /images/Taskmanager.png (0x0, alt="Task Manager Pro"); /images/xlnet.png (0x0, alt="XLNet Emotion"); /images/Fakenews.png (0x0, alt="Fake News Classifier")

Card text is in the table above (the strip renders the 19 cards three times for its infinite loop).

### /writing

- Title: Writing — Nipun Sujesh
- Meta description: Notes from building: AI memory systems, self-assembling agents, production RAG, and why MCP won. Written by someone who ships.
- Canonical: https://www.nipun.space/writing
- Images: —
- Links: —

```text
WRITING_
> ls ~/writing · 5 posts · things i learned by building
26'
[ latest ]
18 Jun 2026
·
2 min read
What RAG looks like once it has a job
Demo RAG and production RAG are different animals. Notes from building automation that people rely on.
rag
llm
work
read
ARCHIVE
02
02 Jun 2026
·
2 min
Why I'm building Uni-Verse
India picks colleges off ads and paid rankings. I'm building the honest record instead.
uni-verse
building
03
14 May 2026
·
2 min
Giving an AI assistant a memory that doesn't rot
Serenity's four-tier memory system, and why a single vector store is not memory.
ai
serenity
architecture
04
20 Apr 2026
·
2 min
Agents that build their own tools
PRAGATI introspects a database at runtime and assembles its own MCP tools. Zero hardcoded tools.
agents
gcp
pragati
05
08 Mar 2026
·
2 min
MCP quietly became the plug
The Model Context Protocol won by being boring. That's usually how standards win.
mcp
agents
opinion
```

### /about

- Title: About — Nipun Sujesh
- Meta description: System monitor of a person: who Nipun is, what's running, his skills, mind map and timeline. Final-year AI & Data Science, AI Workflow Automation intern at impress.ai.
- Canonical: https://www.nipun.space/about
- Images: —
- Links: github.com/Luc0-0 -> https://github.com/Luc0-0; linkedin.com/in/nipun-sujesh -> https://www.linkedin.com/in/nipun-sujesh; nipunsujesh28@gmail.com -> mailto:nipunsujesh28@gmail.com

```text
+++***cccooO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++====------::::::::...........
++***ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOooccc***+++=====------:::::::...........
+**cccooO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00Oooocc***++++====------::::::::..........
**ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOooccc***+++=====-----::::::::..........
*ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooccc***+++=====-----::::::::...........
ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00Oooocc***+++=====-----::::::::..........
ccoOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOoocc***+++=====-----::::::::..........
cooO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOoocc***+++=====-----::::::::..........
ooOO0#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00Oooccc***+++=====-----::::::::..........
ooO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooccc***+++====------:::::::...........
oOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc***++++====------:::::::...........
oOO0#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOoocc***+++=====-----::::::::..........
oO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooccc***+++====------::::::::..........
OO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOoocc***++++====------:::::::...........
OO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOooccc***+++=====-----::::::::..........
OO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooocc***++++====------:::::::...........
OO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOoocc****+++=====-----::::::::..........
OO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOooccc***++++====------:::::::...........
oO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooocc***++++=====-----::::::::..........
oOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++====------:::::::...........
oOO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++=====-----::::::::..........
oOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOooocc****+++=====------:::::::...........
ooOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%##0OOOooccc***++++====------::::::::..........
ooOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++=====------:::::::..........
oooOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOoooccc***++++====------:::::::...........
oooOO00##%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++=====-----::::::::..........
cooOOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOooocc****+++=====------:::::::..........
coooOO00##%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00OOooccc***++++====------:::::::..........
coooOO00##%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOoOOooc**++++*+++----=====::::.:--::.....
coooOO000#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#00OO0%%#o***++*OOoc=---*cccc=:::::**+-.....
ccooOOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%0OO#%%#O***++*OOoc=---*cccc*:::::**+-.....
ccooOOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@0OO#%%#O***++*OOoc=---*cc*c*+::::**+-.....
ccooOOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#0O#%%%O***++*OOoc=---*cc+***-:::**+-.....
ccooOOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#0O#@%%Oc***+*OOOc=---*cc+=**+:::**+-.....
ccooOOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@00O#@%%Oc***+*OOOc==--*cc*:+**=::**+-.....
ccooOO00##%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@##0O#@%%Oc***+*OOOc==--*cc*:-***::**+-.....
ccooOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0O#@%%Oc***+*OOOc==--*cc*::+**=:**+-.....
ccooOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##00#@%%Oc***+*OOOc==--*cc*:::***:**+-.....
ccooOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00#@%%Oc***+cOOOc==--*cc*:::=**++*+-.....
ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#000@%%#c****OOOO*==--*cc*::::+**+*+-.....
ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00O#%%##0OO0OOOc===--*cc*::::-****+-.....
ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOO0###000Oo*===---*cc*:::::=***+-....
ccooO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00Ooooccccc*++====-----:::::::..........
ccooO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00Oooccc***+++====-----:::::::..........
ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#0OOooccc**++++====-----:::::::..........
ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc***+++====------::::::..........
ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc***+++====-----:::::::..........
cccooO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOoccc**++++====-----:::::::.........
*ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#0OOoocc***+++====-----:::::::..........
*cccooO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc**++++====-----:::::::.........
**ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#0OOoocc***+++====-----:::::::..........
***ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00Oooccc**+++====------::::::..........
+***ccooOO0#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc**++++====-----:::::::.........
++***ccooOO0##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOoocc***+++====-----:::::::..........
+++***ccooOO00#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00OOoocc***+++====-----:::::::..........
=+++***ccooOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#00Oooccc***+++====-----:::::::..........
==+++***cccooOO00#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooccc**++++====-----:::::::..........
===++++***cccooOO00##%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%##0OOooocc***+++=====-----:::::::..........
=====++++***ccoooOO00##%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#00OOooocc***++++====------:::::::..........
--====++++****cccooOOO000##%%@@@@@@@@@@@@@@@@@@@@@@%%###00OOoooccc***+++=====------:::::::..........
---=====++++****cccooooOOO000###%%%%%@@@@@@@%%%%####00OOOoooccc****++++====------::::::::..........
-----=====+++++****ccccoooOOOOO00000########000000OOOOooocccc***+++++====------::::::::...........
:------======+++++****cccccooooooOOOOOOOOOOOOOOOooooocccc*****++++=====-------::::::::..........
:::-------======+++++******cccccccooooooooooooccccccc*****++++++=====-------::::::::...........
:::::--------======+++++++*********cccccccccc*********++++++=======-------::::::::............
::::::::--------=======++++++++++**************+++++++++========-------:::::::::............
.::::::::::--------==========+++++++++++++++++++++==========--------::::::::::............
...:::::::::::----------===============================----------:::::::::::............
......::::::::::::--------------===============--------------::::::::::::.............
.........::::::::::::::----------------------------------:::::::::::::..............
.............:::::::::::::::::-------------------:::::::::::::::::................
.................:::::::::::::::::::::::::::::::::::::::::::::.................
...................:::::::::::::::::::::::::::::::::::...................
.........................:::::::::::::::::.........................
ABOUT_
replay
Hey, I'm Nipun.
AI engineer. Builder.
I build systems that solve real problems.
Currently building Uni-Verse, an honest, on-the-record platform for college life.
Exploring AI, full-stack, and where they meet.
Focused on learning and shipping.
SKILLS:
Python
JavaScript
React
Node.js
Express
MongoDB
SQL
AI / ML
System Design
Git
CURRENTLY:
Building Uni-Verse
AI Workflow Automation @ impress.ai
Shipping
LET'S CONNECT:
github.com/Luc0-0
linkedin.com/in/nipun-sujesh
nipunsujesh28@gmail.com
SCROLL · SYSTEM TELEMETRY
SYSTEM UPTIME
1544d 14h 55m
since first commit
LOAD AVG
0.74 0.60 0.48
1m · 5m · 15m
FOCUS
deep work
mode: enabled
MEMORY
6.2G / 16G
brain allocation
STACK
Python · AI/ML · MERN
primary cores
LOCATION
Kerala, IN
IST +5:30
RUNNING PROCESSES ( what i'm working on )
PID
PROCESS
TAG
STATE
CPU
1101
Uni-Verse Platform
[ product ]
●
running
31
1102
impress.ai — AI Workflow Automation
[ work ]
●
running
22
1103
Full-Stack Learning
[ dev ]
●
running
16
1104
Portfolio OS (nipun.os)
[ system ]
●
running
9
1105
Content & LinkedIn
[ growth ]
●
sleep
4
1106
DSA & Algorithms
[ core ]
●
sleep
3
1107
Reading & Research
[ knowledge ]
●
sleep
2
1108
Health & Fitness
[ lifestyle ]
●
sleep
2
1109
Chess & Strategy
[ mental ]
●
sleep
1
1110
Future Systems (ideas)
[ vault ]
●
sleep
1
SYSTEM LOG
[boot] nipun.os online · focus mode enabled
[proc] uni-verse: priority raised to high
[sync] impress.ai internship: tasks synced
[note] rule: ship > iterate > impact
› awaiting next commit_
SKILLS v2.0 ( self-rated )
Python
85
JavaScript
80
React
78
Node / Express
72
MongoDB / SQL
68
AI / ML
88
System Design
60
UI / UX sense
82
Problem Solving
90
Adaptability
82
IDENTITY.SYS
NIPUN
AI Engineer · Builder
Problem solver. Learner. Turns ideas into things that ship.
current.version: becoming
> ~/about_
a map of who i am, what i do, and where i'm headed. drag the nodes.
core.exe
NIPUN
AI ENGINEER
AI / ML
›
LLMs & Agents
›
RAG Pipelines
›
Computer Vision
›
NLP & Embeddings
›
Model Fine-tuning
LangChain
PyTorch
OpenAI
ChromaDB
FULL-STACK
›
React / Next.js
›
Node.js / Express
›
MongoDB / Supabase
›
Tailwind / Shadcn
›
REST APIs
TypeScript
PostgreSQL
Docker
Vercel
PROJECTS
›
Uni-Verse
›
Serenity
›
Guardia
›
Samarth
›
and more...
Production
Open source
Experiments
Live
open →
LEARNING
›
Deep Learning
›
System Design
›
ML Ops
›
Algorithms
›
Human Psychology
Books
Courses
Papers
Mentorship
BEYOND CODE
›
Chess & Strategy
›
Fitness & Health
›
Stoicism
›
Creativity
›
Making Impact
Focus
Consistency
Growth
Purpose
> ~/timeline_
the path so far · 2021 → now
2021
●
10th-grade.edu
EDUCATION
2021
10th Grade — Kendriya Vidyalaya, Delhi
Completed 10th standard with a strong foundation in mathematics and science. First exposure to logical thinking and problem-solving.
2022
●
python.init
SKILL
2022
Python Programming Begins
Started learning Python at Kendriya Vidyalaya. The first lines of code marked the beginning of the journey.
2022
●
12th-grade.edu
EDUCATION
2022
12th Grade — Kendriya Vidyalaya, Kannur
Completed 12th standard, Science stream. Developed a real interest in computer science and technology.
2022
●
btech.enroll
EDUCATION
2022
B.E. AI & Data Science
Enrolled at Kathir College of Engineering (Anna University). Four years combining computer science fundamentals with specialized AI coursework.
2024
●
ibm-ai-dev.cert
CERTIFICATION
2024
IBM AI Developer Certified
Completed the IBM AI Developer Professional Certificate: a 10-course specialization across software engineering, Python, AI concepts, and production deployment.
2025
●
amypo.intern
EXPERIENCE
2025
Full-Stack Developer Intern (MERN) — Amypo Technologies
Jun–Sep 2025. Built responsive web-app features end to end on the MERN stack in an Agile sprint team; designed REST APIs connecting React front ends to MongoDB.
2026
●
genai-academy.cert
CERTIFICATION
2026
Google Gen AI Academy APAC — Cohort 1
Jan–Apr 2026. Built PRAGATI for the Academy hackathon: a self-assembling agentic system on Google ADK, MCP, AlloyDB and Vertex AI, deployed live on Cloud Run.
2026
●
serenity.proj
PROJECT
2026
Serenity — Mental Health AI Capstone
Production multimodal mental-health assistant: four-tier memory, fine-tuned XLM-RoBERTa emotion classifier at 81.3% accuracy, 95% safety recall on crisis detection. Paper submitted to ICRAIA 2025.
2026
●
impress-ai.intern
EXPERIENCE
2026
AI Workflow Automation Engineer Intern — impress.ai
May 2026 → present. Company-wide LLM + RAG workflow automation, reusable AI skills for internal teams, and an embedding-based candidate recommendation system.
2026
●
graduation.exe
MILESTONE
2026
● now
Expected Graduation
Graduating with a B.E. in AI & Data Science. Current GPA 8.24/10. Ready to contribute to the AI industry.
the next commit is unwritten_
```

### /skills

- Title: Skills — Nipun Sujesh
- Meta description: Interactive skill radar: Generative AI and LLMs, RAG and vector search, agentic AI (ADK, MCP), Python, React, cloud. Honestly self-rated, backed by shipped projects.
- Canonical: https://www.nipun.space/skills
- Images: —
- Links: —

```text
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
82
AI / ML
AI / ML // breakdown
← all sectors
GenAI & LLMs
88
Claude
Gemini
LLM APIs
in: impress.ai · Serenity
RAG & Vector Search
85
Embeddings
pgvector
in: impress.ai · PRAGATI
Agentic AI
82
Google ADK
MCP
in: PRAGATI
NLP & Fine-tuning
80
PyTorch
HuggingFace
XLM-R
in: Serenity
Prompt Engineering
85
Claude
Gemini
in: impress.ai
Computer Vision
72
YOLOv8
OpenCV
TFLite
in: Guardia
```

#### Skills sector: AI / ML

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
82
AI / ML
AI / ML // breakdown
← all sectors
GenAI & LLMs
88
Claude
Gemini
LLM APIs
in: impress.ai · Serenity
RAG & Vector Search
85
Embeddings
pgvector
in: impress.ai · PRAGATI
Agentic AI
82
Google ADK
MCP
in: PRAGATI
NLP & Fine-tuning
80
PyTorch
HuggingFace
XLM-R
in: Serenity
Prompt Engineering
85
Claude
Gemini
in: impress.ai
Computer Vision
72
YOLOv8
OpenCV
TFLite
in: Guardia
```

#### Skills sector: LANGUAGES

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
79
LANGUAGES
LANGUAGES // breakdown
← all sectors
Python
88
Pandas
NumPy
Scikit-learn
in: Serenity · PRAGATI · Guardia
JavaScript
80
ES2023
Node
in: Uni-Verse · Portfolio
SQL
70
Postgres
AlloyDB
in: PRAGATI · Uni-Verse
```

#### Skills sector: BACKEND

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
76
BACKEND
BACKEND // breakdown
← all sectors
FastAPI
78
asyncpg
Flask
in: Serenity · PRAGATI
Node / Express
72
MERN
JWT
in: Amypo · Task Manager
REST & Webhooks
78
APIs
SSE
in: impress.ai · Serenity
Apps Script
75
Slack API
Workspace
in: impress.ai
```

#### Skills sector: FRONTEND

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
70
FRONTEND
FRONTEND // breakdown
← all sectors
React 19
80
Hooks
Router
in: Serenity · Portfolio
Next.js
65
App Router
in: Uni-Verse
Three.js
60
R3F
drei
in: Portfolio
Vite
75
Tailwind
Motion
in: Portfolio · Serenity
```

#### Skills sector: DATA

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
70
DATA
DATA // breakdown
← all sectors
Postgres · pgvector
75
Supabase
RLS
in: Serenity · Uni-Verse
AlloyDB
68
GCP
MCP Toolbox
in: PRAGATI
MongoDB
70
Atlas
Mongoose
in: Amypo · Task Manager
Supabase · Firestore
68
Auth
Edge Fns
in: Uni-Verse · Serenity
```

#### Skills sector: CLOUD / DEVOPS

```text
~/skills
· calibrated loadout
> ~/skills_
the stack, honestly rated · self-calibrated · click a sector
ALL
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
AI / ML
LANGUAGES
BACKEND
FRONTEND
DATA
CLOUD / DEVOPS
70
CLOUD / DEVOPS
CLOUD / DEVOPS // breakdown
← all sectors
Google Cloud
72
Cloud Run
Vertex AI
in: PRAGATI
Docker
62
Compose
in: PRAGATI · Serenity
Deploy
75
Vercel
Railway
Render
in: Serenity · Portfolio
Azure · Firebase
58
AI Fundamentals
in: Azure AI projects
Git · GitHub
85
CI
3-branch flow
in: everything
```

### /services

- Title: Services — Web, AI Apps & Automation | Nipun Sujesh
- Meta description: Hire Nipun for web development, custom AI applications, and RAG chatbots trained on your website and documents. Scoped and quoted per project.
- Canonical: https://www.nipun.space/services
- Images: /images/services/theme-3.png (800x1000, alt="e-commerce website theme concept"); /images/services/theme-1.png (800x1000, alt="editorial website theme concept"); /images/services/theme-6.png (800x1000, alt="3d interactive website theme concept"); /images/services/theme-5.png (800x1000, alt="brand studio website theme concept"); /images/services/theme-2.png (800x1251, alt="saas dashboard website theme concept"); /images/services/theme-4.png (800x1000, alt="terminal website theme concept")
- Links: —

```text
SERVICES_
> ~/services --hire · three things i build for people · scoped and quoted per project
● currently: ai workflow automation @ impress.ai
● serenity — live in production
● pragati — deployed on cloud run
taking select projects alongside final year
ALL
WEB
AI APPS
AUTOMATION
01
SVC 01
Web Development
Sites people remember. Portfolios, product landings, brand pages — designed and built end to end, from first sketch to deployed domain.
Design + build, one person, no handoff loss
Motion, 3D and sound where it earns its place
SEO-ready, responsive, fast
Deployed and handed over on your domain
React
Next.js
Tailwind
Three.js
Framer Motion
start a project
→
e-commerce · stores · drops
editorial · magazines · blogs
3d interactive · experiences
brand studio · agencies · launches
saas dashboard · products · tools
terminal · this site
6 theme directions · every panel designed & coded by me · hover to pause
02
SVC 02
Custom AI Applications
Full AI products, not just prompts. Assistants with memory, multimodal apps, fine-tuned models — built, evaluated, and shipped to production.
Full stack: model + backend + interface
Fine-tuning when off-the-shelf isn't enough
Evals and safety behavior, not vibes
Deployed with auth, monitoring, and a handover doc
Python
FastAPI
PyTorch
LLM APIs
React
start a project
→
● assistant.live — multimodal, with memory
like serenity.nipun.space — live, in production
03
SVC 03
RAG · Chatbots · Automation
A chatbot that actually knows your business. I do RAG over your website, docs and FAQs, wire agents into your tools, and automate the hours nobody should be spending.
Custom chatbot trained on your website + documents
No made-up answers: it quotes your own docs and hands off to a human when unsure
Agents connected to your stack (MCP, APIs, Slack)
Runs on your site, WhatsApp, or wherever customers are
RAG
Embeddings
MCP
pgvector
LLM APIs
start a project
→
● pipeline.map — your data → real work
docs
embed
retrieve
agent
action
like pragati — agents that assemble their own tools
> compose --brief_
tell me what you need. lands straight in my inbox, i reply with a scope and a quote.
from:
reply-to:
service:
Web Development
Custom AI Applications
RAG · Chatbots · Automation
brief:
:send brief
```

### /achievements

- Title: Achievements — Nipun Sujesh
- Meta description: Google Gen AI Academy APAC Cohort 1, IBM AI Developer Professional Certificate, ICRAIA research paper, 15+ shipped projects. All real, all verifiable.
- Canonical: https://www.nipun.space/achievements
- Images: /images/achievements/genai-academy.png (834x626, alt="Google Gen AI Academy APAC certificate"); /images/achievements/ibm-ai-dev.png (1000x773, alt="IBM AI Developer Professional Certificate certificate"); /images/achievements/python-ds.png (1000x773, alt="Python for Data Science, AI & Development certificate"); /images/achievements/prompt-eng.png (1000x773, alt="Generative AI Prompt Engineering certificate")
- Links: view cert -> /images/achievements/intro-ai.png; view cert -> /images/achievements/python-ds.png; view cert -> /images/achievements/prompt-eng.png; view cert -> /images/achievements/flask-apps.png; view cert -> /images/achievements/genai-apps.png; view cert -> /images/achievements/intro-se.png; view cert -> /images/achievements/html-css-js.png; verify on linkedin -> https://www.linkedin.com/in/nipun-sujesh

```text
UNLOCKED_
> ~/achievements · all real, all verifiable
GPA
8.24
/ 10 · B.E. AI & DS
SHIPPED
15+
projects, agents to CV
RESEARCH
1
paper submitted · ICRAIA
WINS
2026
[ cohort 1 · 2026 ]
Google Gen AI Academy APAC
Selected for cohort 1 (Jan–Apr 2026). Built PRAGATI for the Academy hackathon: a self-assembling agentic system on Google ADK, MCP, AlloyDB and Vertex AI, deployed live on Cloud Run.
hide certificate
2025
[ research · 2025 ]
Paper — ICRAIA 2025
Serenity, a multimodal mental-health assistant: four-tier memory, fine-tuned XLM-RoBERTa at 81.3% emotion accuracy, 95% safety recall on crisis detection. Submitted.
2022→
[ builder · 2022→ ]
15+ Shipped Projects
AI agents, computer vision, NLP and RAG pipelines. From hackathon builds to production deploys with real users.
school
[ 2nd place · school ]
Maths Olympiad — Delhi Zonal
Early proof the pattern-matching engine boots fine under pressure.
CERTIFICATIONS
IBM AI Developer Professional Certificate
IBM · Coursera · 2025
7 courses
›
Introduction to Artificial Intelligence
view cert
›
Python for Data Science, AI & Development
view cert
›
Generative AI Prompt Engineering
view cert
›
Developing AI Applications with Python and Flask
view cert
›
Building Generative AI Powered Applications
view cert
›
Introduction to Software Engineering
view cert
›
Introduction to HTML, CSS, and JavaScript
view cert
Microsoft Azure AI Fundamentals
Microsoft · 2025
Python for Data Science, AI & Development
IBM · 2025
view
Generative AI Prompt Engineering
IBM · 2025
view
verify on linkedin
```

### /opensource

- Title: Open Source — Nipun Sujesh
- Meta description: Public code: GodProfile, an MCP server with 16 tools, and NLP-from-scratch learning notebooks.
- Canonical: https://www.nipun.space/opensource
- Images: —
- Links: [ mcp server ]
GodProfile

An MCP server -> https://github.com/Luc0-0/GodProfile; [ learning resource ]
learning-nlp-from- -> https://github.com/Luc0-0/learning-nlp-from-scratch; ~/work -> /work; everything else on github -> https://github.com/Luc0-0

```text
OPEN SOURCE_
> gh repos --public · tools and resources built for others to use
[ mcp server ]
GodProfile
An MCP server packed with 16 tools that turn a plain markdown README into an animated, glassmorphic GitHub profile. Point an agent at it and let it design your profile for you.
Python
MCP
GitHub API
github.com/Luc0-0
[ learning resource ]
learning-nlp-from-scratch
NLP fundamentals implemented from the ground up: Bag of Words, TF-IDF, LSA, and topic modeling in clear, step-by-step Jupyter notebooks. Written for people learning, not for people showing off.
Python
Jupyter
scikit-learn
github.com/Luc0-0
project source lives with each project → ~/work
everything else on github
```

### /contact

- Title: Contact — Nipun Sujesh
- Meta description: Open a channel: email, GitHub, LinkedIn, or the form that lands straight in Nipun's inbox. Open to Generative AI Engineer roles, 2026.
- Canonical: https://www.nipun.space/contact
- Images: —
- Links: email
nipunsujesh28@gmail.com -> mailto:nipunsujesh28@gmail.com; github
github.com/Luc0-0 -> https://github.com/Luc0-0; linkedin
linkedin.com/in/nipun-sujesh -> https://www.linkedin.com/in/nipun-sujesh; resume
download the PDF -> /images/Nipun_Sujesh_Resume.pdf

```text
> compose --to nipun_
lands straight in my inbox · or pick a channel on the right
from:
reply-to:
body:
:send
$ channels --list
email
nipunsujesh28@gmail.com
github
github.com/Luc0-0
linkedin
linkedin.com/in/nipun-sujesh
resume
download the PDF
Kerala, India · IST +5:30
open to: Generative AI Engineer roles · 2026
```

### /map

- Title: Site Blueprint — Nipun Sujesh
- Meta description: The portfolio drawn as its own engineering schematic: every page as a module, the command bar as the bus, LucBot as the daemon.
- Canonical: https://www.nipun.space/map
- Images: —
- Links: —

```text
> ~/map_
the site, documenting itself · hover a module · click to enter
1
2
3
4
5
A
B
C
D
CMD BUS /
HOME
✓
terminal hero
WORK
✓
11 modules
ABOUT
✓
system monitor
SKILLS
✓
radar
SERVICES
✓
for hire
WRITING
✓
5 posts
ACHIEVEMENTS
✓
unlocked
OPEN SOURCE
✓
public code
CONTACT
✓
open a channel
LUCBOT●
daemon · answers from every module
sounds: webaudio synth,
zero samples
rag: 91 chunks · bm25 + embeddings
· rrf · answers only from site data
cursor: aim reticle · css only
stack: react 19 · vite · vercel
· ollama cloud · gemini embeddings
NOTES
hover a module to read its annotation. green pins = visited.
NIPUN.OS — SITE BLUEPRINT
SHEET 1/1
DRAWN: NIPUN
CHECKED: LUCBOT
REV 2.0 · 2026.07
SCALE 1:1
```

