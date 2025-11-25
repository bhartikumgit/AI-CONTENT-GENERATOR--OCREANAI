# 🚀 AI Content Generator (OCREANAI)

A powerful, full-stack AI document generation platform that transforms text prompts into professional **Word Documents (.docx)** and **PowerPoint Presentations (.pptx)** using Google's Gemini 2.0 Flash API.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20Gemini-blue)

## ✨ Features

- **🤖 AI-Powered Content**: Generates context-aware content for documents and slides using Gemini 2.0 Flash.
- **📝 Intelligent Outlines**: Automatically suggests professional outlines and slide structures based on your topic.
- **🎨 Modern UI**: Beautiful, responsive interface built with React, Vite, and Framer Motion.
- **🔄 Interactive Refinement**: Refine content with natural language prompts (e.g., "Make this more professional", "Shorten this section").
- **📂 Project Management**: Dashboard to manage multiple document projects.
- **📄 Multi-Format Export**: Download your creations as perfectly formatted `.docx` or `.pptx` files.
- **🔒 Secure Auth**: User registration and login with JWT authentication.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** (Fast build & dev experience)
- **Framer Motion** (Smooth animations)
- **React Router** (Navigation)
- **Vanilla CSS Variables** (Custom, scalable design system)

### Backend
- **FastAPI** (High-performance Python web framework)
- **SQLAlchemy** (SQLite Database ORM)
- **Google Gemini API** (LLM Integration)
- **python-docx** & **python-pptx** (Document generation)
- **JWT** (Authentication)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/bhartikumgit/AI-CONTENT-GENERATOR--OCREANAI.git
    cd AI-CONTENT-GENERATOR--OCREANAI
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    # Create virtual environment (optional but recommended)
    python -m venv venv
    # Windows: venv\Scripts\activate
    # Mac/Linux: source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt

    # Configure Environment
    # Create a .env file in the backend folder with:
    # GEMINI_API_KEY=your_api_key_here
    # SECRET_KEY=your_secret_key
    # DATABASE_URL=sqlite:///./app.db
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```

### 🏃‍♂️ Running the App

You need to run both the backend and frontend terminals.

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn app.main:app --reload
```
*Backend runs at http://localhost:8000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend runs at http://localhost:5173*

## 📖 How to Use

1.  **Register/Login**: Create an account to access your dashboard.
2.  **New Project**: Click "New Project", select **Word** or **PowerPoint**, and enter a topic (e.g., "Future of AI in Healthcare").
3.  **Configure**: Use **"AI Suggest Outline"** to generate sections, or add them manually.
4.  **Generate**: Enter the Editor and click **"Generate All Content"**. Watch as AI fills in your document!
5.  **Refine**: Click on any section to edit text or use the AI "Refine" box to rewrite content.
6.  **Export**: Click the **Export** button to download your final file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
