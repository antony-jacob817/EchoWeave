# 🌌 EchoWeave

**EchoWeave** is an intelligent, full-stack web application that transforms unstructured voice notes into structured, interactive mind maps. By leveraging AI, it analyzes thought patterns and automatically generates visual workspaces, helping users brainstorm, organize, and export their ideas with a pixel-perfect dark-theme aesthetic.

<img width="1737" height="860" alt="cover" src="https://github.com/user-attachments/assets/ac8f060b-192d-40b0-9666-5dbd8ba63cf3" />

## ✨ Key Features

* 🎤 **Voice Capture & Processing:** Integrated voice recording for seamless idea dumping.
* 🧠 **Echo AI Insights:** Powered by Google's Gemini AI to deeply analyze voice notes and extract core themes and actionable data.
* 🗺️ **Automated Mind Mapping:** Instantly converts AI analysis into interactive, draggable node graphs using React Flow and Dagre auto-layout.

* 🎨 **Premium Glassmorphism UI:** A sleek, modern interface built with Tailwind CSS, featuring custom neon drop-shadows, ambient background blurs, and smooth Framer Motion animations.
* 📥 **High-Fidelity Exports:** Export workspaces as Retina-quality (2x pixel ratio) PNGs or PDFs without UI clutter.
* 🔐 **Secure Authentication:** User management and database functionality powered by Supabase.

## 🛠️ Tech Stack

**Frontend:**

* React 19 & TypeScript
* TanStack Start (SSR & Routing)
* Tailwind CSS & Radix UI (Styling & Components)
* React Flow (Node-based UI)
* Framer Motion (Animations)
* Zustand (State Management)

**Backend & AI:**

* Vercel Serverless Functions (`/api` routes)
* Supabase (PostgreSQL Database & Auth)
* Google Generative AI (Gemini 2.5 Flash)

## 🚀 Getting Started

### Prerequisites

Because this project relies on Vercel Serverless Functions, you must have the Vercel CLI installed globally on your machine to run it locally.

```bash
npm i -g vercel

```

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/antony-jacob817/EchoWeave.git
cd EchoWeave

```


2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory and add your API keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_key

```


4. **Link to Vercel & Start the Local Environment:**
First, link your local project to your Vercel deployment:
```bash
vercel link

```


Then, pull your environment variables:
```bash
vercel env pull .env.local

```


Finally, start the local development server (this correctly spins up both your Vite frontend and your `/api` functions):
```bash
vercel dev

```


The app will be running at `http://localhost:3000`.

## ☁️ Deployment

EchoWeave is configured for optimized Server-Side Rendering (SSR) deployment natively on **Vercel**.

1. Push your code to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Set the Framework Preset to **Vite**.
4. Clear the Output Directory override (leave it blank) to allow Vercel to automatically detect the build folder.
5. Ensure your Environment Variables are added in the Vercel settings.
6. Deploy!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

*Built by Antony Jacob.*