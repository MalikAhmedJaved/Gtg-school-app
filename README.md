# Glory to God PPEC Mobile App

React Native mobile app for Glory to God Miami — a Prescribed Pediatric Extended Care (PPEC) facility in Miami, Florida. Built with Expo.

## Audience

- **Parents** of enrolled children — home feed, therapy updates, photo gallery, announcements, and chat with employees.
- **Employees** (nurses, CNAs, HHAs, therapists, RBTs) — compliance document upload, chat with parents.
- **Managers** — approve/download employee compliance documents, monitor staff credentialing.

## Prerequisites

- Node.js 20 LTS
- npm
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (macOS only)
- Android: Android Studio

## Installation

```bash
npm install
```

## Running

```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web
```

## Project structure

```
mobile-app/
├── assets/                # App icons, splash, logos
├── src/
│   ├── components/
│   │   ├── Auth/          # ProtectedRoute
│   │   └── Common/        # Button, Checkbox, ErrorBoundary, Logo, etc.
│   ├── constants/         # Theme, colors, spacing
│   ├── contexts/          # Auth, Language, Toast
│   ├── languages/         # en.json, es.json
│   ├── screens/
│   │   ├── Announcements/
│   │   ├── Auth/          # Login, Register, ForgotPassword, ResetPassword
│   │   ├── Categories/    # Therapy categories
│   │   ├── Chat/
│   │   ├── Gallery/
│   │   ├── Home/
│   │   ├── Notifications/ # Instagram + YouTube feed
│   │   ├── Profile/
│   │   └── Settings/
│   └── utils/             # api, formatters, mockData, rootNavigation
├── App.js
├── app.json
└── package.json
```

## Configuration

### API URL

Set `EXPO_PUBLIC_API_URL` in `.env` at the project root:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

The PPEC backend is not yet deployed — the app falls back to `http://localhost:3000/api` when the env var is unset.

### Languages

English and Spanish are supported. Add new strings to both `src/languages/en.json` and `src/languages/es.json`.

## Current status

- ✅ Authentication (Login, Register, Forgot/Reset Password)
- ✅ Home feed with greeting, therapy updates, quick links
- ✅ Therapy categories
- ✅ Photo gallery (mock data)
- ✅ Announcements
- ✅ Notifications tab (Instagram + YouTube placeholder feed)
- ✅ Chat (mock data, UI only)
- ✅ Profile + Settings (English/Spanish toggle)
- ⏳ Compliance module — planned (see [progress.md](progress.md))
- ⏳ Backend API — not yet built (see [progress.md](progress.md) for stack plan)

## Troubleshooting

1. **Metro bundler issues** — `npx expo start -c` to clear cache
2. **Dependencies issues** — delete `node_modules` and `package-lock.json`, then `npm install`
3. **SVG not rendering** — verify `react-native-svg` and `react-native-svg-transformer` are installed

## License

Private — Glory to God Miami.
