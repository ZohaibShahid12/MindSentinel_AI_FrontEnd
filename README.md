# Mind Sentinel AI — Frontend

React Native mobile app for mood tracking, wellness chat, daily tasks, and reports.

## Requirements

- Node.js 18+
- Android Studio (for Android builds)
- Backend API running (see BackEnd repository)

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` if present, or set the API base URL in `src/api/client.ts` (`PC_LAN_IP` for physical device testing).

## Run

Start Metro:

```bash
npm start
```

In another terminal:

```bash
npm run android
```

For a physical device, use the same Wi‑Fi network as your PC and set `PC_LAN_IP` in `src/api/client.ts` to your computer's LAN address.

## Project structure

```
src/
├── api/          API client and endpoints
├── screens/      App screens
├── navigation/   React Navigation setup
├── storage/      AsyncStorage helpers
└── utils/        Validation and helpers
```
