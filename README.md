# SplitMate Mobile - Production-Ready Receipt Splitting App# Welcome to your Expo app 👋

A React Native mobile app for splitting expenses with friends, powered by Google Gemini AI for automated receipt scanning. Converted from the web version with enhanced mobile features, offline support, and robust error handling.This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🎯 Project Overview## Get started

**SplitMate** helps groups split bills fairly by:1. Install dependencies

1. Setting up who's splitting (2+ people required)

2. Scanning receipts via camera or file upload (processed by Gemini AI via secure server proxy) ```bash

3. Assigning items to specific people npm install

4. Automatically calculating who owes what ```

### Key Features2. Start the app

- ✨ **NO on-device OCR** - All AI processing via secure Gemini proxy server

- 📱 iOS-first design following Human Interface Guidelines ```bash

- 🔄 **Offline upload queue** with persistence (survives app restarts) npx expo start

- ♻️ **Exponential backoff retry** with jitter (4 attempts, configurable) ```

- 📊 Real-time upload progress tracking

- 🎨 Claude AI-inspired color paletteIn the output, you'll find options to open the app in a

- 🔒 Secure - API keys never exposed to client

- 📲 Push notifications for scan completion- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- ⚡ React Query for server state management- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- 🐻 Zustand for local state- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

---

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 📁 Project Structure

## Get a fresh project

````

SplitMate/When you're ready, run:

├── app/

│   ├── _layout.tsx           # Root layout with providers```bash

│   ├── index.tsx              # Redirect to tabsnpm run reset-project

│   └── (tabs)/```

│       ├── _layout.tsx        # Tab navigation

│       ├── index.tsx          # Setup screen (add people)This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

│       ├── upload.tsx         # Upload/camera screen

│       └── split.tsx          # Item splitting screen## Learn more

├── src/

│   ├── components/            # Reusable componentsTo learn more about developing your project with Expo, look at the following resources:

│   ├── hooks/                 # Custom hooks

│   ├── services/              # API & React Query- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

│   ├── stores/                # Zustand stores- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

│   ├── types/                 # TypeScript types

│   └── utils/                 # Utilities## Join the community

├── server/gemini-proxy/       # Backend server

├── __tests__/                 # Unit testsJoin our community of developers creating universal apps.

└── README.md

```- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## 🚀 Getting Started

### Mobile App

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
````

### Server Setup

```bash
cd server/gemini-proxy
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

---

## ⚙️ Configuration

### Retry Policy

```typescript
DEFAULT_RETRY_CONFIG = {
  maxAttempts: 4,
  initialDelayMs: 500,
  factor: 2,
  jitter: true,
};
```

### File Limits

- Max file size: 10MB
- Supported: JPG, PNG, PDF

---

## 🧪 Testing

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

---

## 📡 API Endpoints

### POST /api/scan

Upload receipt for processing

### GET /api/scan/:scanJobId

Get scan status and results

---

## 🎨 Design System

Claude AI-inspired warm color palette with accent orange (#D97757) and neutral grays.

---

## 🚢 Deployment

### iOS (TestFlight)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Server

Deploy to Heroku, Railway, or Render with Redis for production queue.

---

## 📄 License

MIT

---

**Happy Splitting! 🎉**
