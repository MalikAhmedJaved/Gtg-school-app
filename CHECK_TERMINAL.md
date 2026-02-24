# How to See Errors - Check Your Terminal!

Since you can't copy from mobile, **the easiest way is to check your computer terminal** where you ran `npm start` or `npx expo start`.

## Steps:

1. **Look at the terminal window** where Expo is running
2. **Scroll up** to see previous messages
3. **Look for RED error messages** - they will be clearly visible
4. **Copy the error message** (usually starts with "Error:" or "Unable to resolve...")
5. **Paste it here** so I can fix it

## What to Look For:

The terminal will show errors like:

```
ERROR  Unable to resolve module "./assets/logo.svg" from "src/components/Common/Logo.js"
```

or

```
ERROR  TypeError: Cannot read property 'X' of undefined
```

or

```
ERROR  Module not found: Can't resolve 'some-package'
```

## If You Don't See Errors in Terminal:

1. **Stop Expo** (press `Ctrl+C` in the terminal)
2. **Clear cache and restart:**
   ```bash
   cd "b:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
   npx expo start -c
   ```
3. **Scan QR code again** on your phone
4. **Watch the terminal** - errors will appear there immediately

## Alternative: Take a Photo

If you still can't see errors:
- **Take a photo** of the red error screen on your phone
- **Describe what you see** - even a partial error message helps!

---

**The terminal is the best place to see errors!** All errors that happen on your phone will also show in the terminal where Expo is running.
