# Testing Guide - Homework Helper Mobile App

## Quick Start

### 1. Backend Must Be Running
```bash
cd /Users/jzissimos/Projects/homework-helper-simple/backend
npm run dev
# Should be running at http://localhost:3000
```

### 2. Start Mobile App
```bash
cd /Users/jzissimos/Projects/homework-helper-simple/mobile
npx expo start
```

### 3. Open on Device
- **iOS Simulator**: Press `i` in Expo terminal
- **Android Emulator**: Press `a` in Expo terminal
- **Physical iPhone**: Install "Expo Go" app, scan QR code

---

## Test Accounts

### Katie's Account (Already Created)
- **Email**: katie@test.com
- **Password**: katie123
- **Age**: 11
- **Voice**: shimmer
- **Points**: 10 (from previous testing)

### Create New Account
Use the "Create Account" button on login screen:
- Name: Any name
- Age: 5-18
- Email: Any valid email
- Password: Any password

---

## Testing Checklist

### Auth Flow
- [ ] Open app - should show login screen
- [ ] Login with Katie's account
- [ ] Should redirect to Home tab
- [ ] Logout from Profile
- [ ] Should redirect back to login
- [ ] Create new account
- [ ] Should redirect to Home tab

### Home Screen
- [ ] Shows user's name in greeting
- [ ] Shows correct total points
- [ ] Shows "Start Learning" button
- [ ] Shows conversation history (if any)
- [ ] Pull-to-refresh updates data
- [ ] Tap "Start Learning" goes to conversation screen

### Profile Screen
- [ ] Shows user name, age, email
- [ ] Shows total points
- [ ] Shows 6 voice options
- [ ] Current voice is highlighted
- [ ] Tap voice to change it
- [ ] Success alert appears
- [ ] Voice updates in backend
- [ ] Logout button works

### Conversation Screen (MOST IMPORTANT!)
- [ ] Press "Start Learning"
- [ ] Microphone permission prompt appears
- [ ] Grant permission
- [ ] Status changes to "Connecting..."
- [ ] Status changes to "Listening..."
- [ ] Pulsing circle animation appears
- [ ] Duration timer starts counting
- [ ] **SPEAK**: Say "Hello, can you help me with math?"
- [ ] AI should respond with voice
- [ ] Circle changes color when AI speaks
- [ ] Status changes to "AI Tutor Speaking..."
- [ ] Conversation continues
- [ ] Press "End Session"
- [ ] Alert shows points earned
- [ ] Redirects to Home
- [ ] Home shows updated points
- [ ] Home shows new conversation in history

---

## Known Issues & Troubleshooting

### Backend Not Connecting
**Symptom**: Login fails, "Network Error"
**Fix**:
```bash
# Check backend is running
curl http://localhost:3000/api/voices
# Should return JSON with 6 voices
```

### Microphone Permission Denied
**Symptom**: Can't start conversation, permission error
**Fix**:
- iOS: Settings → Privacy → Microphone → Expo Go → Enable
- Android: Settings → Apps → Expo Go → Permissions → Microphone → Allow

### WebSocket Connection Fails
**Symptom**: "Failed to start session" error
**Fix**:
1. Check OPENAI_API_KEY in backend/.env
2. Check internet connection
3. Try again - temporary OpenAI issue

### Audio Not Working
**Symptom**: No sound from AI tutor
**Fix**:
1. Check device volume is up
2. Check not in silent mode
3. Try headphones
4. WebSocket audio streaming may need additional setup

### App Crashes on Conversation Screen
**Symptom**: App closes when starting conversation
**Fix**:
1. Check Expo logs for errors
2. Microphone permission might be required
3. WebSocket connection might have failed

---

## Testing on iOS vs Android

### iOS Specific
- Microphone permission handled by expo-av
- WebSocket should work natively
- Test on real device for best audio experience
- Simulator may not have microphone access

### Android Specific
- Microphone permission in AndroidManifest.xml
- WebSocket should work natively
- Test on real device for audio

---

## Development Testing Tips

### Quick Test Loop
1. Make code changes
2. Save file
3. Expo auto-reloads
4. Test the change
5. Repeat

### Reset App State
- Shake device → "Reload"
- OR press `r` in Expo terminal

### Clear Async Storage (Logout Not Working)
```javascript
// Add temporarily to any screen
import AsyncStorage from '@react-native-async-storage/async-storage'
AsyncStorage.clear()
```

### Check Network Requests
- Expo debug menu → "Debug Remote JS"
- Open Chrome DevTools
- Check Network tab

---

## Next Steps After Testing

1. **Fix Bugs**: Note any issues and fix them
2. **Polish UI**: Improve styling, animations
3. **Add Features**:
   - Topic selection before conversation
   - Voice previews
   - Better error messages
4. **Deploy Backend**: Deploy to Vercel for production
5. **Build App**: Create iOS/Android builds
6. **Test with Katie**: Real-world testing!

---

## Success Criteria

✅ **App is Ready for Katie** when:
1. She can login
2. She can see her points
3. She can start a voice conversation
4. The AI tutor responds with voice
5. She can end the conversation
6. Her points increase
7. The conversation appears in history

---

Last Updated: 2025-10-23
