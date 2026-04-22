# Progress Log

## 2026-04-20 — Notifications tab + Android build

### 1. Added Notifications bottom tab
- Added a 5th tab "Notifications" (bell icon) to the bottom tab bar in [App.js](App.js), placed between Chat and Profile.
- Imports `NotificationsScreen` and registers it as `NotificationsTab` with active `notifications` / inactive `notifications-outline` Ionicons.

### 2. Rewrote NotificationsScreen as a social feed
- Replaced the old admin task/job-seeker notifications UI in [src/screens/Notifications/NotificationsScreen.js](src/screens/Notifications/NotificationsScreen.js) with a social-media-style feed.
- Shows **5 dummy posts** mixing Instagram (`@glorytogodppec`) and YouTube (`Glory to God PPEC`) updates.
- Each card has: source badge (Instagram pink / YouTube red), thumbnail image, title, handle, caption preview, relative time, and a "View on X" link that opens the real profile URL via `Linking.openURL`.
- Pull-to-refresh supported (simulated with a 700ms delay on dummy data).
- Note: real API integration (Instagram Graph API / YouTube Data API v3) is still TODO — swap `DUMMY_POSTS` with fetched data when ready.

### 3. Fixed bottom nav layout on web
- On wide viewports React Navigation was rendering labels **beside** icons (default `beside-icon`), which looked crowded with 5 tabs.
- In [App.js](App.js) `MainTabs` `screenOptions`:
  - Forced `tabBarLabelPosition: 'below-icon'`
  - Added `tabBarItemStyle: { flexDirection: 'column' }`
  - Bumped bar height 56 → 64, increased top padding to 8, added `marginTop: 2` on labels
  - `tabBarAllowFontScaling: false` to stop label inflation on zoom
- Result: icons and labels now stack cleanly on both web and native.

### 4. Triggered Android preview build on EAS
- Account: `malik1460`
- Profile: `preview` (APK, internal distribution) from [eas.json](eas.json)
- Keystore: existing remote `Build Credentials Y4M0CZf_-7`
- Build URL: https://expo.dev/accounts/malik1460/projects/glory-to-god-app/builds/384f207a-8028-4cb4-b4ed-2f9ade3177c4
- Status at save time: queued/building on EAS cloud (expected 15–25 min total).

### Known warnings / follow-ups
- EAS flagged `cli.appVersionSource` as missing in [eas.json](eas.json) — not blocking yet, will be required in a future EAS CLI release.
- Old admin notifications screen behavior (fetch `/notifications`, mark-as-read, open related task/user) is removed. If still needed elsewhere, will need to be reintroduced under a different screen name.
