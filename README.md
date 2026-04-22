# ⚖️ Bail Reckoner — AI-Powered Bail Prediction System

> A production-ready full-stack application that predicts bail decisions for Indian law cases using a fine-tuned LegalBERT model hosted on HuggingFace Hub.

---

## 🗂️ Project Structure

```
bail-reckoner/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # HuggingFace Spaces deployment
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx   # 10-field case input form
│   │   │   ├── ResultCard.jsx  # Verdict + confidence display
│   │   │   └── Navbar.jsx      # Top navigation bar
│   │   ├── App.jsx             # Root component + state management
│   │   ├── App.css             # Global styles + Tailwind imports
│   │   └── main.jsx            # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                # VITE_API_URL environment variable
└── README.md
```

---

## 🧠 ML Model

- **Model ID**: [`Baunty7/bail-reckoner`](https://huggingface.co/Baunty7/bail-reckoner)
- **Architecture**: LegalBERT fine-tuned for text classification
- **Labels**:
  - `LABEL_1` → **Bail Granted**
  - `LABEL_0` → **Bail Rejected**

---

## 🚀 Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

API will be available at `http://localhost:8000`

- `GET /` → Health check
- `POST /predict` → Bail prediction

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

> **Important**: Update `frontend/.env` with your backend URL:
> ```
> VITE_API_URL=http://localhost:8000
> ```

---

## 📦 Deployment

### Backend → HuggingFace Spaces

1. Create a new Space on [HuggingFace](https://huggingface.co/new-space) with **Docker** SDK.
2. Upload the contents of the `backend/` folder.
3. The `Dockerfile` exposes port `7860` as required by HF Spaces.
4. After deployment, copy your Space URL (e.g. `https://username-bail-reckoner.hf.space`).

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repository.
2. Import the repo on [Vercel](https://vercel.com).
3. Set the environment variable:
   ```
   VITE_API_URL=https://your-hf-space-url.hf.space
   ```
4. Deploy!

---

## ⚙️ API Reference

### `POST /predict`

**Request Body:**

| Field              | Type   | Values                          |
|--------------------|--------|---------------------------------|
| `fir_details`      | string | Free text                       |
| `ipc_sections`     | string | e.g. `"302, 307"`              |
| `crime_type`       | string | `"bailable"` / `"non-bailable"`|
| `accused_name`     | string | Full name                       |
| `age`              | number | Positive integer                |
| `gender`           | string | `"Male"` / `"Female"` / `"Other"` |
| `criminal_history` | string | Description or `"None"`        |
| `severity`         | string | `"Low"` / `"Medium"` / `"High"` |
| `evidence_strength`| string | `"Weak"` / `"Moderate"` / `"Strong"` |
| `flight_risk`      | string | `"Low"` / `"Medium"` / `"High"` |

**Response:**

```json
{
  "decision": "Bail Granted",
  "confidence": 87.43,
  "label": "LABEL_1"
}
```

---

## 🔒 Rule-Based Override Logic

Before returning the model result, the following hard rules are applied:

| Condition | Override |
|-----------|----------|
| `crime_type == "non-bailable"` AND `severity == "High"` | → **Bail Rejected** |
| `criminal_history != "None"/"empty"` AND `flight_risk == "High"` | → **Bail Rejected** |
| `severity == "Low"` AND `criminal_history == "None"/"empty"` | → **Bail Granted** |

---

## 🛡️ Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Python 3.10, FastAPI, Uvicorn |
| ML        | HuggingFace Transformers, PyTorch |
| Frontend  | React 18, Vite, Tailwind CSS v3 |
| HTTP      | Axios |
| Hosting   | HuggingFace Spaces (backend), Vercel (frontend) |

---

## ⚠️ Legal Disclaimer

This tool is AI-generated and for **research and educational purposes only**.
It should **not** be treated as legal advice. Always consult a qualified legal professional before making any bail-related decisions.

---

*Built for Smart India Hackathon | Bail Reckoner © 2025*
