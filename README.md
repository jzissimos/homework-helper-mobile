# Homework Helper - Mobile App

Voice-powered AI tutor mobile app built with React Native, Expo, and OpenAI Realtime API.

## Features

- 🎤 **Real-time Voice Conversations** with AI tutor
- 📚 **Socratic Teaching Method** - guides students to discover answers
- ⭐ **Points System** - earn points for learning time
- 🗣️ **6 AI Voices** to choose from (shimmer, ballad, alloy, echo, verse, sage)
- 📊 **Conversation History** - track all learning sessions
- 👤 **User Profiles** - personalized for each student

## Tech Stack

- **React Native** with Expo
- **Expo Router** for navigation
- **TypeScript** for type safety
- **OpenAI Realtime API** for voice streaming
- **Axios** for API calls
- **AsyncStorage** for local auth tokens
- **Expo AV** for audio permissions

## Project Structure

```
mobile/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Entry point / auto-router
│   ├── (auth)/              # Auth screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/              # Main app tabs
│       ├── _layout.tsx
│       ├── index.tsx        # Home screen
│       ├── conversation.tsx # Voice learning session
│       └── profile.tsx      # User profile
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   │
│   ├── services/            # API and business logic
│   │   └── api.ts          # Backend API client
│   │
│   ├── theme/               # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── utils/               # Utility functions
│   │   └── formatters.ts
│   │
│   └── config/              # Configuration
│       └── env.ts
│
├── .env                     # Environment variables
├── app.json                 # Expo configuration
├── package.json
├── TESTING.md              # Testing guide
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on iPhone/Android
- Backend server running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Update .env with backend URL:**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```
   (For production, use your Vercel URL)

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Test on device:**
   - Install "Expo Go" app on iPhone/Android
   - Scan QR code from terminal
   - OR press `i` for iOS Simulator / `a` for Android Emulator

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| EXPO_PUBLIC_API_URL | Backend API base URL | `http://localhost:3000` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android Emulator |
| `npm run web` | Open in web browser |

## Screens

### Login & Register
- Email/password authentication
- Input validation
- Error handling
- Auto-redirect after login

### Home
- Welcome greeting with user's name
- Points display (large, engaging)
- "Start Learning" CTA button
- Recent conversation history
- Pull-to-refresh

### Conversation
- WebSocket connection to OpenAI
- Real-time voice streaming
- Visual feedback (pulsing animation)
- Duration timer
- Points calculation (2 points/minute)
- Session end/save

### Profile
- User avatar and info
- Points card
- Voice selector (6 voices)
- Voice descriptions
- Logout

## API Integration

The app connects to the backend API for:
- **Authentication** - register, login, current user
- **Profile** - get/update user profile
- **Voices** - list available AI voices
- **Conversations** - start session, end session, view history

See `src/services/api.ts` for complete API client.

## OpenAI Realtime API

The conversation screen connects directly to OpenAI's Realtime API WebSocket:

1. Backend creates ephemeral session token
2. Mobile app connects to WebSocket with token
3. Audio streams bidirectionally
4. AI responds with Socratic teaching prompts
5. Session ends, results saved to backend

### Voice Options

- **shimmer** - Warm and friendly (8-12 years)
- **ballad** - Clear and energetic (10-14 years)
- **alloy** - Balanced and steady (9-13 years)
- **echo** - Gentle and supportive (8-12 years)
- **verse** - Expressive and engaging (9-13 years)
- **sage** - Clear and wise (11-15 years)

## Theme System

### Colors
Kid-friendly, engaging color palette:
- Primary: Indigo (#6366F1)
- Secondary: Pink (#EC4899)
- Success: Green (#10B981)
- Background: Light gray (#F9FAFB)

### Typography
Consistent text styles:
- Headers (h1-h4)
- Body text (regular, small)
- Labels, captions
- Button text

### Spacing
Systematic spacing scale:
- xs (4px), sm (8px), md (12px), lg (16px)
- xl (24px), xxl (32px), xxxl (48px)

## Components

### Reusable UI Components

- **Button** - Primary, secondary, outline variants
- **TextInput** - Styled input with error state
- **Card** - Container with variants (default, elevated, outlined)
- **LoadingScreen** - Full-screen loading indicator
- **EmptyState** - Empty list placeholder
- **ErrorBoundary** - Catches React errors gracefully

## Development

### Hot Reload
Expo automatically reloads when you save files. Changes appear instantly on device.

### Debugging
- Shake device → "Debug Remote JS"
- Chrome DevTools for console logs
- React DevTools for component inspection

### Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

**Quick Test:**
1. Login with Katie's account (katie@test.com / katie123)
2. Navigate through all screens
3. Start a voice conversation
4. Test voice selection in profile

## Known Issues

### iOS Safari Microphone
Microphone permissions must be granted immediately on user gesture. The app handles this correctly.

### WebSocket Connection
First connection may take a few seconds. Error handling and retry logic included.

### Audio Streaming
Currently sets up WebSocket connection. Full audio streaming implementation requires additional native modules.

## Deployment

### TestFlight (iOS)
```bash
eas build --platform ios
eas submit --platform ios
```

### Google Play (Android)
```bash
eas build --platform android
eas submit --platform android
```

See [Expo EAS documentation](https://docs.expo.dev/eas/) for details.

## Contributing

1. Make changes in feature branch
2. Test thoroughly on iOS and Android
3. Commit with descriptive messages
4. Push to GitHub

## Support

For issues, questions, or feedback:
- Check [TESTING.md](./TESTING.md) for troubleshooting
- Review backend [API.md](../backend/API.md) for API details
- Check Expo logs for errors

## License

Private project for family use.

---

**Built with ❤️ for Katie and family**
