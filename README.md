# ⚖️ ClauseGuard — AI Contract Risk Analyzer

🔗 **Live Demo:** [https://clause-guard-nine.vercel.app](https://clause-guard-nine.vercel.app)
ClauseGuard is an **AI-powered contract analysis platform** that helps users identify **risky clauses, ambiguous language, and legal red flags** before signing agreements.

The system uses **LLM-powered reasoning** to analyze legal documents and provides:

* 📊 Risk scoring
* 🚩 Clause-level risk detection
* 💡 Suggested safer wording
* 📈 Analytics dashboard
* ⚖️ Document comparison
* 🕐 Analysis history tracking

Built with a **modern full-stack architecture** and designed with a **SaaS-style UI dashboard**.

---

# 🚀 Features

### 🔍 AI Contract Analysis

Upload or paste contracts and let AI automatically:

* Detect risky clauses
* Classify them by category
* Explain the legal risk
* Suggest improved wording

---

### 🚩 Clause Risk Detection

Each clause is evaluated and labeled as:

* 🔴 High Risk
* 🟠 Medium Risk
* 🟢 Low Risk

The system also highlights **ambiguous or vague language**.

---

### 📊 Risk Score System

Each document receives an overall **risk score (0–100)** based on detected clauses.

Example:

```
High Risk Contract → Score: 82
Medium Risk Contract → Score: 56
Low Risk Contract → Score: 21
```

---

### 📈 Analytics Dashboard

Visual insights including:

* Documents analyzed
* Risk distribution
* High-risk clause counts
* Category breakdown
* Recent analyses

---

### ⚖️ Document Comparison

Compare two contracts to identify:

* Added risky clauses
* Changed legal wording
* Increased liability exposure

---

### 🕐 Analysis History

All analyzed documents are saved with:

* Timestamp
* Risk score
* Clause count
* Quick access to results

---

# 🖥️ Tech Stack

### Frontend

* React
* React Router
* Tailwind / Custom UI
* Modern SaaS Dashboard UI

### Backend

* Node.js
* Express
* REST API

### AI / LLM

* Groq API
* Llama models
* Prompt-based clause classification

### Data Processing

* PDF.js for PDF parsing
* Structured clause extraction
* Risk scoring engine

---

# 📂 Project Structure

```
ClauseGuard
│
├── frontend
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── context
│   └── services
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── ai
│   └── database
│
└── docs
```

---

# ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Rahilchavda/ClauseGuard.git
cd ClauseGuard
```

---

### 2️⃣ Install frontend dependencies

```bash
cd frontend
npm install
```

---

### 3️⃣ Install backend dependencies

```bash
cd ../backend
npm install
```

---

### 4️⃣ Environment variables

Create `.env` in backend:

```
GROQ_API_KEY=your_api_key
PORT=5000
```

---

### 5️⃣ Start development servers

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

---

# 📊 Example Workflow

1️⃣ Upload a contract or paste text
2️⃣ AI analyzes clauses
3️⃣ Risk score is generated
4️⃣ Clauses are categorized and explained
5️⃣ Suggested safer wording is provided

---

# 🏗️ System Architecture

### ClauseGuard follows a modern full-stack architecture where the frontend interacts with an API backend, which processes documents and calls an AI model for clause analysis.
                        ┌─────────────────────────┐
                        │        User             │
                        │ Upload / Paste Contract │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │       Frontend          │
                        │        (React)          │
                        │                         │
                        │ • Document Upload       │
                        │ • Results Viewer        │
                        │ • Dashboard Analytics   │
                        │ • History & Compare     │
                        └─────────────┬───────────┘
                                      │ API Calls
                                      ▼
                        ┌─────────────────────────┐
                        │        Backend          │
                        │      Node.js / API      │
                        │                         │
                        │ • File Parsing          │
                        │ • Clause Extraction     │
                        │ • Risk Scoring Logic    │
                        │ • History Storage       │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │      AI Engine          │
                        │    Groq + Llama/Mistral │
                        │                         │
                        │ • Clause Classification │
                        │ • Risk Detection        │
                        │ • Ambiguity Detection   │
                        │ • Suggested Fixes       │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   Structured Analysis   │
                        │                         │
                        │ • Clause Results        │
                        │ • Risk Score            │
                        │ • Category Breakdown    │
                        │ • Explanations          │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │      Frontend UI        │
                        │                         │
                        │ • Clause Cards          │
                        │ • Risk Gauge            │
                        │ • Dashboard Charts      │
                        │ • History Tracking      │
                        └─────────────────────────┘
---

# 🔐 Security & Limitations

* This tool **does not replace professional legal advice**
* AI analysis may not capture every legal nuance
* Always consult a legal professional before signing critical contracts

---

# 🌟 Future Improvements

## 📈 Scaling Strategy

ClauseGuard is architected to scale from a solo project to an enterprise-grade legal intelligence platform. Below are the key scaling strategies:

---

### 1. 🔄 Horizontal Scaling with Worker Queues

**Problem:** Concurrent document uploads overwhelm a single server instance.

**Solution:** Introduce a Redis-backed job queue (BullMQ) with a horizontally scalable worker pool.
```
User Upload → Redis Queue (BullMQ)
                    ↓
          Worker Pool (N FastAPI instances)
                    ↓
          Each worker processes 1 document independently
                    ↓
          Result pushed back via WebSocket
```

- Workers scale up/down based on queue depth
- No single point of failure
- Cost scales with actual usage, not peak capacity

---

### 2. ⚡ Intelligent Document Caching

**Problem:** The same contract template (NDA, employment agreement, SaaS terms) gets analyzed hundreds of times — wasting API calls and money.

**Solution:** Hash every document with SHA-256 and cache results in Redis.
```
SHA-256(document text)
        ↓
Check Redis cache (TTL: 24 hours)
        ↓
Cache Hit?  → Return instantly (0ms, $0 cost)
Cache Miss? → Run full analysis → store result in cache
```

- Reduces Groq API costs by up to **70%** for repeated templates
- Sub-millisecond response for previously analyzed documents

---

### 3. 🚀 Chunk-Level Parallel Processing

**Problem:** Large documents processed chunk-by-chunk are slow.

**Solution:** Use `asyncio.gather()` to process all chunks simultaneously.
```python
# Current (sequential)
for chunk in chunks:
    result = await analyze(chunk)

# Scaled (parallel)
results = await asyncio.gather(
    *[analyze(chunk) for chunk in chunks]
)
```

- 10-chunk document becomes **10x faster**
- All chunks hit Groq API simultaneously
- Results merged and re-ranked by severity score

---

### 4. 🧠 Smart Model Routing by Document Size

**Problem:** Running a 70B parameter model on a 200-word NDA is wasteful.

**Solution:** Route documents to the appropriate model based on size and complexity.

| Document Size | Model | Reason |
|--------------|-------|--------|
| < 500 words | Llama 3.1 8B | Fast, cheap, sufficient |
| 500–2000 words | Llama 3.3 70B | Balanced performance |
| > 2000 words | Llama 3.3 70B (chunked + parallel) | Full accuracy |
| Jurisdiction-specific | Fine-tuned legal model | Domain expertise |

- Saves ~60% on API costs for short documents
- Users get faster results on simple contracts

---

### 5. 🎯 Fine-Tuned Legal Model (Long-term Vision)

**Problem:** General-purpose LLMs lack knowledge of Indian contract law, RBI regulations, SEBI guidelines, and NaBFID-specific terms.

**Solution:** Fine-tune Llama on a curated dataset of Indian legal contracts.
```
Collect 10,000+ analyzed Indian contracts
              ↓
Fine-tune Llama on jurisdiction-specific legal data
              ↓
Host on Replicate / Modal
              ↓
3x more accurate for Indian law at 50% lower cost
```

- Recognizes RBI clauses, RERA terms, GST implications
- Understands NaBFID sanction letter structures
- Creates a **defensible competitive moat** no general AI can replicate

---

### 6. 🏢 Multi-Tenant Enterprise Architecture

**Problem:** Law firms and banks need data isolation, custom rate limits, and private clause libraries.

**Solution:** Namespace every resource per tenant.
```
Each enterprise client gets:
├── Isolated MongoDB collection
├── Custom rate limits & usage quotas
├── Private clause library & templates
├── Their own fine-tuned model weights
└── SOC2-compliant data handling
```

- Target clients: NaBFID, HDFC Legal, Khaitan & Co, AZB & Partners
- Pricing model: ₹50,000/month per enterprise seat
- Zero data leakage between tenants

---

### 7. 🌏 CDN + Edge Deployment for Indian Market

**Problem:** US-hosted servers add 250–300ms latency for Indian users.

**Solution:** Move infrastructure closer to users.

| Layer | Current | Scaled |
|-------|---------|--------|
| Frontend | Vercel (US) | Vercel Edge → Mumbai node |
| Backend | Render (US) | AWS ap-south-1 (Mumbai) |
| Database | MongoDB Atlas (US) | MongoDB Atlas (Mumbai region) |

- Reduces latency from ~280ms → ~40ms
- Critical for enterprise adoption in the Indian legal market

---

### Scaling Summary

| Strategy | Impact | Complexity |
|----------|--------|------------|
| Worker Queues | 100x throughput | Medium |
| Document Caching | 70% cost reduction | Low |
| Parallel Chunks | 10x speed on large docs | Low |
| Model Routing | 60% cost reduction | Medium |
| Fine-tuned Model | 3x accuracy for Indian law | High |
| Multi-tenant Architecture | Enterprise revenue stream | High |
| Edge Deployment | 7x faster for Indian users | Low |

> ClauseGuard is built to scale from a student project to a legal-tech platform serving India's top law firms — without rewriting a single line of core logic.

---

# 👨‍💻 Author

**Rahil Chavda**

AI & Full-Stack Developer

GitHub:
https://github.com/Rahilchavda

---

# 📜 License

MIT License
