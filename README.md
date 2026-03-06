# ⚖️ ClauseGuard — AI Contract Risk Analyzer

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
* Llama / Mistral models
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

Planned features:

* Clause highlighting directly in PDFs
* Legal domain fine-tuned model
* Contract version diffing
* Multi-language contract support
* Team collaboration dashboard

---

# 👨‍💻 Author

**Rahil Chavda**

AI & Full-Stack Developer

GitHub:
https://github.com/Rahilchavda

---

# 📜 License

MIT License
