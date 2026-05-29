# GisunOS - High Performance Web-Based Operating System

![GisunOS Release Banner](https://raw.githubusercontent.com/Vaggiri/Giri-OS/main/client/public/logo.png)

> **Experience the future of the web as a professional workstation.**

GisunOS is a production-grade, high-performance web-based operating system designed with a macOS-inspired aesthetic. Built for the modern web, it provides a seamless desktop experience with a unified full-stack architecture, optimized for both desktop and mobile landscape users.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVaggiri%2FGiri-OS)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## 🚀 Key Features

*   **💎 Premium Glassmorphism UI**: A stunning interface with dynamic real-time blur, atmospheric flows, and high-performance spring animations.
*   **📱 Mobile-First Landscape Guardian**: Automatically scales and optimizes the entire OS for mobile landscape mode with a dedicated orientation enforcement system.
*   **⚡ Smooth Touch Interaction**: GPU-accelerated window dragging and resizing, specifically tuned for responsive touch-screen performance.
*   **🌉 GisunBridge Proxy**: Integrated high-speed proxy bridge that allows secure, ad-free browsing and cross-origin YouTube/Media playback.
*   **🪟 Virtual Window Manager**: A native-feeling windowing system with support for stacking, snapping, minimizing, and desktop persistence.
*   **🛠️ Developer Suite**: Functional Terminal, File System (VFS), and integrated Activity Monitor with real-time performance metrics.

---

## 🏗️ Architecture

GisunOS is built using a unified Full-Stack Monorepo architecture designed for effortless cloud deployment:

- **Frontend**: React 18, Vite, Framer Motion, and Tailwind CSS.
- **Backend API**: Node.js / Express serverless functions (standard Vercel API structure).
- **Core State**: Global state management with Zustand for high-speed persistence.
- **Vering Logic**: Advanced proxy shielding for loading external web content without security errors.

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v20.x (Recommended)
- **Supabase Account**: For persistent cloud storage and authentication.

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Vaggiri/Giri-OS.git
   cd Giri-OS
   ```

2. **Install Dependencies**:
   ```bash
   # Install all frontend and backend dependencies from the root
   npm install
   cd client && npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_backend_key
   ```

4. **Run Development**:
   ```bash
   # Start the frontend dev server
   cd client && npm run dev
   ```

---

## 🚀 Deployment (Vercel)

GisunOS is pre-configured for **Vercel** out of the box:

1. Connect your GitHub repository to Vercel.
2. The `vercel.json` will automatically handle:
   - Compiling the React frontend to `client/dist`.
   - Routing `/api/*` requests to the serverless function in `/api/index.js`.
   - Setting up SPA fallback for the router.
3. Ensure you add your Environment Variables in the Vercel Dashboard.

---

## 📸 Screenshots

*loading....*
- **Desktop View**: Highlighting the Dock and Menu Bar.
- **Mobile Mode**: Showing the Compact UI and Orientation Guardian.
- **GisunTube**: Demonstrating ad-free video playback through the proxy.

---

## 🤝 Contributing

We welcome professional contributions! Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for our architectural standards and coding guidelines.

---

## 👤 Author

**Vaggiri** - Lead Architect & Designer
*   GitHub: [@Vaggiri](https://github.com/Vaggiri)

---

## ⚖️ Legal & Fair Use

GisunOS is an open-source, non-commercial educational project. It integrates third-party services like YouTube and Google Maps via official APIs and proxies.

*   **Fair Use**: Usage of third-party metadata and embeds is intended for transformative educational purposes and does not compete with the original services.
*   **No Hosting**: GisunOS does not host or distribute copyrighted media files.
*   **Trademarks**: All trademarks (YouTube, Google, VLC, etc.) belong to their respective owners.

For full legal details, please refer to the [LEGAL_NOTICE.md](LEGAL_NOTICE.md).

---

## ⚖️ License

GisunOS is licensed under the **GNU General Public License v3.0**. 

Protecting authorship and the open-source spirit is vital to our lab. All derivatives must remain open-source and maintain original attribution to **Vaggiri**.

---
*GisunOS - The absolute desktop for the open web.*
