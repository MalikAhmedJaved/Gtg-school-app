# How to Get the Error Message from Red Screen

Since you're seeing a **red error screen**, we need to see the **exact error message** to fix it.

## Method 1: Enable Remote Debugging (Easiest)

### On Your Phone:
1. **Shake your phone** (or press `Ctrl+M` if using emulator)
2. Tap **"Debug Remote JS"** (or "Debug" on iOS)
3. You should see "Debugger connected" message

### On Your Computer:
1. Open **Chrome** browser
2. Go to: `chrome://inspect`
3. Under **"Remote Target"**, you should see your device
4. Click **"inspect"** next to your device
5. A new window opens → Click the **"Console"** tab
6. **Copy ALL the red error messages** you see
7. **Paste them here** so I can fix them

## Method 2: Check Metro Terminal

Look at the terminal where you ran `npm start` or `npx expo start`. 
- Look for **red error messages**
- Copy the **first error** you see (usually starts with "Error:" or "Unable to resolve...")
- Paste it here

## Method 3: Take a Screenshot

If you can't enable debugging:
1. **Take a screenshot** of the red error screen on your phone
2. The error message should be visible in the screenshot
3. Share what you see

## Common Red Screen Errors:

- **"Unable to resolve module..."** → Missing import or wrong path
- **"Cannot read property 'X' of undefined"** → Missing data/state
- **"Module not found"** → Missing dependency
- **"SyntaxError"** → Code error

## Quick Fix to Try First:

```bash
# Stop Expo (Ctrl+C)
# Then restart with cache clear:
cd "b:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
npx expo start -c
```

Then scan QR code again and see if error still appears.

---

**Please share the error message you see!** Once I know the exact error, I can fix it immediately.
