# Cleaning Service Mobile App

React Native mobile application for the Cleaning Service platform, built with Expo.

## Features

- All screens from the web application
- Authentication (Login/Register)
- Client, Admin, and Cleaner dashboards
- Services pages (Private, Commercial, Move-in/Move-out)
- About, Contact, and Careers pages
- Multi-language support (English/Danish)
- Theme matching the SVG logo colors (#2c7a7b teal and #38a169 green)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the Expo development server:
```bash
npm start
```

### Run on iOS:
```bash
npm run ios
```

### Run on Android:
```bash
npm run android
```

### Run on Web:
```bash
npm run web
```

## Project Structure

```
mobile-app/
├── assets/              # Images, logos, and other assets
│   └── logo.svg        # App logo (from SVG file)
├── src/
│   ├── components/     # Reusable components
│   │   ├── Auth/       # Authentication components
│   │   └── Common/     # Common components (Button, Logo, etc.)
│   ├── contexts/       # React contexts (Auth, Language, Toast)
│   ├── constants/      # Theme and constants
│   ├── languages/      # Translation files
│   ├── screens/        # Screen components
│   │   ├── HomePage/
│   │   ├── Services/
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── Careers/
│   │   ├── Auth/
│   │   └── Dashboards/
│   └── utils/          # Utility functions and API
├── App.js              # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Configuration

### API Configuration

Update the API base URL in `src/utils/api.js`:
```javascript
const getApiBaseURL = () => {
  return 'YOUR_API_URL_HERE';
};
```

### Environment Variables

Create a `.env` file in the root directory for environment-specific variables (you may need to install `react-native-config` or use Expo's environment variables).

## Features Implemented

✅ Home page with hero section and service cards
✅ Services pages (Private, Commercial, Move-in/Move-out)
✅ About page
✅ Contact page with form
✅ Careers page with job application
✅ Login/Register authentication
✅ Client Dashboard
✅ Admin Dashboard
✅ Cleaner Dashboard
✅ Multi-language support
✅ Theme matching web app colors
✅ SVG logo integration

## Notes

- The app uses AsyncStorage for local data persistence (replacing localStorage from web)
- Navigation is handled by React Navigation
- The app is configured to work with the same backend API as the web application
- All screens match the web application's functionality and design

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Dependencies issues**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
3. **SVG not displaying**: Ensure `react-native-svg` and `react-native-svg-transformer` are installed

## License

Same as the main project.
