# Drawer Navigation Setup

I've added drawer navigation to the app. You need to install the required packages:

## Installation Steps

1. **Install drawer navigation and reanimated:**
   ```bash
   npm install @react-navigation/drawer react-native-reanimated --legacy-peer-deps
   ```

2. **Or use Expo's install command:**
   ```bash
   npx expo install react-native-reanimated
   npm install @react-navigation/drawer --legacy-peer-deps
   ```

## What's Been Added

✅ **Drawer Menu** - Side menu accessible from hamburger icon (☰) in header
✅ **All Static Pages** - Home, Services, About, Contact, Careers
✅ **Login/Register** - In the drawer menu
✅ **All 3 Dashboards** - Client, Admin, and Cleaner dashboards accessible from menu
✅ **Quick Links on Home** - Cards to navigate to all static pages

## Features

- **Hamburger Menu Icon** (☰) appears in the header of main pages
- **Custom Drawer** with logo and organized menu sections
- **Authentication-aware** - Shows Login/Register when logged out, Dashboard/Logout when logged in
- **All Dashboards** - Access to Client, Admin, and Cleaner dashboards from menu

## Navigation Structure

- Drawer Navigator (outer)
  - Stack Navigator (inner)
    - All screens (Home, Services, About, Contact, Careers, Login, Register, Dashboards)

The drawer can be opened by:
- Tapping the hamburger icon (☰) in the header
- Swiping from the left edge of the screen
