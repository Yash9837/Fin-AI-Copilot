
# Intercom AI-Enhanced Admin Panel

## 🧠 Overview

The **Intercom AI-Enhanced Admin Panel** is a modern web application I developed using **React** and **Tailwind CSS** to streamline customer support operations. By integrating **FREE Hugging Face AI (LLaMA 3.2)**, I enabled AI-driven features like intelligent response suggestions, conversation summaries, and tone rephrasing—empowering support agents to work more efficiently without any API costs.

The app features a sleek, responsive layout with an inbox sidebar, chat area, and AI Copilot panel—all designed with adjustable widths, independent scrolling, and a user-centric approach to enhance productivity.

This project showcases my ability to build scalable, AI-integrated applications with a focus on user experience, responsiveness, and practical functionality—skills I’m eager to bring to your team to solve real-world challenges.

---

## 🚀 Features

- **Inbox Sidebar:** View and select conversations with intuitive sorting, filtering, and search functionality.
- **Priority & Tags:** Mark conversations as priority and filter by status (All, Unread, Priority).
- **Smart Search:** Search conversations by name, email, or message content.
- **Chat Area:** Displays messages with AI-generated replies and options to suggest video calls for complex issues.
- **AI Copilot Panel:**
  - Provides concise AI-powered response suggestions (2–3 sentences) using FREE Hugging Face AI.
  - Surfaces relevant knowledge base articles to assist agents.
  - Supports follow-up questions with AI-generated insights.
  - Sentiment analysis and conversation tagging.
- **Rich Composer:**
  - Text formatting (bold, italic, code, links, headings).
  - Emoji picker with quick access.
  - File attachment preview.
  - AI-powered tone rephrasing (friendly, professional, formal).
  - Conversation summarization.
- **Details Panel:** Quick access to user details and conversation metadata.
- **Resizable Layout:** Draggable divider to resize the AI Copilot panel for a personalized experience.
- **Keyboard Shortcuts:** 
  - `Ctrl/Cmd + Enter`: Send message
  - `Ctrl/Cmd + K`: Focus search
  - `Esc`: Clear composer
- **Persistent Storage:** Conversations auto-save to localStorage.
- **Responsive Design:** Optimized for both desktop and mobile devices.

---

## 🛠 Technical Highlights

- Built with **React** and **Next.js** for a dynamic, modular front-end.
- Styled using **Tailwind CSS** for clean, responsive, and maintainable UI.
- Integrated **FREE Hugging Face Inference API** (LLaMA 3.2) for intelligent AI features.
- **No API costs** - completely free AI integration with retry logic.
- Implemented **localStorage** for persistent conversation history.
- Implemented **draggable resizable layout**, enhancing UX.
- Ensured **independent scrolling** across panels for smooth interaction.
- **Keyboard shortcuts** for power users.
- **Real-time typing indicators** and smooth animations.

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- **No API key required!** Uses free Hugging Face Inference API
- *(Optional)* Get a [Hugging Face API token](https://huggingface.co/settings/tokens) for higher rate limits

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/intercom-ai-admin-panel.git
cd intercom-ai-admin-panel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API (Optional)

The app works out-of-the-box with FREE Hugging Face Inference API. For higher rate limits, optionally create a `.env.local` file:

```env
NEXT_PUBLIC_HF_API_KEY=your-hugging-face-token-here
```

To get a free token:
1. Sign up at [Hugging Face](https://huggingface.co/join)
2. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token (free)

**Note:** The app will work without a token, but may have lower rate limits.

### 4. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the app.

---

## 🚀 Deployment

**📚 Full Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) and [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) for comprehensive guides.

### Quick Deploy Options

#### 1. Vercel (Recommended - 2 minutes) ⚡

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Yash9837/Fin-AI-Copilot)

**Via Button:**
1. Click button above → Import repository
2. (Optional) Add `NEXT_PUBLIC_HF_API_KEY` in environment variables
3. Deploy → Done! 🎉

**Via CLI:**
```bash
npm i -g vercel
vercel --prod
```

#### 2. Netlify (3 minutes) ⚡

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Yash9837/Fin-AI-Copilot)

**Via Button:**
1. Click button → Connect GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. (Optional) Add `NEXT_PUBLIC_HF_API_KEY` in environment
5. Deploy! 🚀

**Via CLI:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### 3. Docker (5 minutes) 🐳

```bash
# Build and run
docker build -t fin-ai-copilot .
docker run -p 3000:3000 -e NEXT_PUBLIC_HF_API_KEY=your_key fin-ai-copilot

# Or use Docker Compose
docker-compose up -d
```

#### 4. Manual VPS (10 minutes) 🖥️

```bash
# Use automated build script
chmod +x build-production.sh
./build-production.sh

# Start production server
npm start
```

### CI/CD with GitHub Actions 🔄

Automated workflows included:

- **`ci-cd.yml`**: Test, build, and deploy on push to main
- **`docker.yml`**: Build Docker images and push to GitHub Container Registry

**Setup:**
1. Add GitHub secrets:
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (for Vercel)
   - `NEXT_PUBLIC_HF_API_KEY` (optional)
2. Push to main branch → Auto-deploy! ✨

### Environment Variables

**Required:** None! App works 100% free without any API keys.  
**Optional:** `NEXT_PUBLIC_HF_API_KEY` - Hugging Face token for higher rate limits (30k req/month vs 1k req/day)

Create `.env.production.local`:
```bash
cp .env.production .env.production.local
# Edit with your values
```

---

## 💼 Why Hire Me?

This project demonstrates my ability to deliver a **production-ready, deployable application** using modern technologies like **React**, **Tailwind CSS**, and **FREE AI integration**. The app is fully optimized for deployment on Vercel, Netlify, or Docker, with built-in security headers and performance optimizations. I'm passionate about building tools that solve real problems—as evidenced by the AI features that enhance customer support efficiency without any costs.

My focus on responsive design, usability, and clean code makes me a strong candidate to contribute to your team’s success. I’m excited to bring my skills in **front-end development**, **API integration**, and **user-centered design** to build impactful solutions for your organization.

---

## 📬 Contact

I’d love to discuss how I can contribute to your team!

📧 Email: [your-email@example.com](mailto:your-email@example.com)  
🔗 GitHub: [github.com/your-username](https://github.com/your-username)

---

## 👨‍💻 Built with 💻 by [Your Name]

---

## 📝 Notes for Use

- **Copy and Paste:** You can copy the content above and paste it into your GitHub repository’s `README.md` file.
- **Customization:** Be sure to replace `your-username`, `your-actual-gemini-api-key`, `your-email@example.com`, and `Your Name` with your actual information.
- **Markdown Rendering:** GitHub will render this Markdown with proper formatting for a professional look.
