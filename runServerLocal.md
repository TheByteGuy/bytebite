Here’s a super short README-style doc you can drop into `bytebite/README.md` or wherever.

---

# ByteBite Dev Setup

Simple dev setup with:

* **frontend** → React (Vite)
* **backend** → Node + Express

## Requirements

* Node.js + npm installed

---

## 1. Backend (API)

**Location:** `bytebite/backend`

### Install deps (first time)

```bash
cd backend
npm install
```

### Run backend

```bash
npm start
```

* Server runs at: `http://localhost:5000`
* Test in browser: `http://localhost:5000/api/health`

(Optional) `.env` in `backend/`:

```env
PORT=5000
```

---

## 2. Frontend (React)

**Location:** `bytebite/frontend`

### Install deps (first time)

```bash
cd frontend
npm install
```

(Optional) `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### Run frontend

```bash
npm run dev
```

* App runs at: `http://localhost:5173` (or whatever Vite prints)

---

## 3. Typical workflow

In **two terminals**:

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

That’s it. Frontend talks to backend at `http://localhost:5000`.
