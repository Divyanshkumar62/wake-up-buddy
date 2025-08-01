# WakeUpBuddy

WakeUpCoach helps users build early wake-up habits using sleep tracking, AI coaching, and gamified routines.

## Features

- **Modern React + Vite + TypeScript**: Modular folder structure for components, pages, hooks, services, and utils.
- **Supabase Authentication**: Secure email/password login and signup.
- **Wake-Up Streak Tracking**: Log your early wake-ups, see your current streak, and last wake-up time. Streaks only count if you log before 8:00 AM (local time).
- **Groq AI Motivational Messages**: After each successful wake-up log, receive a unique, uplifting motivational message powered by Groq AI.
- **Capacitor Local Notifications**: Get daily wake-up reminders on your Android device. Pick your preferred reminder time (default 6:30 AM), and change or cancel it anytime from the dashboard.
- **Mobile-First, Responsive UI**: Clean, modern, and animated interface with Tailwind CSS and Framer Motion.

## Folder Structure

```
client/
  src/
    components/    # Reusable UI elements (e.g., AuthForm)
    pages/         # Route-level components (Dashboard, Login, Signup)
    hooks/         # Custom React hooks
    services/      # API logic (Supabase, Groq, wakeupService, etc.)
    utils/         # Shared helper functions
```

## Setup & Usage

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Variables

Create a `.env` file in `client/`:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

### 3. Capacitor Setup (Android)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/local-notifications
npx cap init WakeUpCoach com.wakeup.app --web-dir=dist
npx cap add android
npx cap sync
```

### 4. Run the App (Web/Dev)

```bash
npm run dev
```

### 5. Build & Run on Android

```bash
npm run build
npx cap copy android
npx cap open android
```

Then run on your device/emulator from Android Studio.


## Tech Stack

- React 19 + Vite + TypeScript
- Supabase (auth & database)
- Groq AI (motivational messages)
- Capacitor (Android, Local Notifications)
- Tailwind CSS (UI)
- Framer Motion (animations)

---

**WakeUpCoach**: Build your early wake-up habit with science, AI, and a little fun! 
