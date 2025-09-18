# MeroVote Mobile App

A React Native mobile application for the MeroVote voting platform, converted from the original React web application.

## Features

- **Voting System**: Support for both reaction-based and one-vs-one voting
- **Real-time Updates**: Live poll data and vote counts
- **Mobile-Optimized UI**: Touch-friendly interface with haptic feedback
- **Authentication**: Google and Facebook OAuth integration
- **Admin Dashboard**: Poll management and analytics
- **Offline Support**: Basic offline functionality with data caching
- **Multi-language Support**: Internationalization ready

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **React Query**: Data fetching and caching
- **React Navigation**: Navigation between screens
- **Expo Vector Icons**: Icon library
- **Expo Haptics**: Haptic feedback for mobile interactions

## Project Structure

```
merovote_app/
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen
│   ├── login.tsx          # Login screen
│   └── admin.tsx          # Admin dashboard
├── components/            # Reusable components
│   ├── Header.tsx         # App header
│   ├── VotingCard.tsx     # Reaction-based voting card
│   ├── ComparisonCard.tsx # One-vs-one voting card
│   ├── BannerCarousel.tsx # Banner carousel
│   └── PollCategories.tsx # Poll category navigation
├── services/              # API services
│   └── api.ts            # API client
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
├── utils/                # Utility functions
│   └── mobile.ts         # Mobile-specific utilities
├── config/               # App configuration
│   └── app.ts           # App constants and themes
└── assets/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd merovote_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://txmr1pcp-3300.inc1.devtunnels.ms
EXPO_PUBLIC_APP_NAME=MeroVote
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
```

### API Configuration

The app connects to the MeroVote backend API. Make sure the backend server is running and accessible at the configured URL.

## Key Features

### Mobile-Optimized Components

- **Touch Interactions**: All buttons and interactive elements are optimized for touch
- **Haptic Feedback**: Provides tactile feedback for user actions
- **Responsive Design**: Adapts to different screen sizes
- **Pull-to-Refresh**: Native pull-to-refresh functionality
- **Loading States**: Proper loading indicators and error handling

### Voting System

- **Reaction-Based Voting**: Thumbs up/down, emoji reactions
- **One-vs-One Voting**: Candidate comparison with visual progress bars
- **Real-time Updates**: Live vote counts and poll status
- **Vote Validation**: Prevents duplicate voting and expired poll voting

### Authentication

- **OAuth Integration**: Google and Facebook login
- **Guest Access**: Browse polls without authentication
- **Session Management**: Automatic token refresh and logout

### Admin Features

- **Poll Management**: Create, edit, delete, and pause polls
- **Analytics Dashboard**: View poll statistics and user engagement
- **Real-time Monitoring**: Live updates on poll performance

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Deployment

### iOS App Store

1. Build the app using Expo Build Service
2. Submit to App Store Connect
3. Follow Apple's review process

### Google Play Store

1. Build the app using Expo Build Service
2. Upload to Google Play Console
3. Follow Google's review process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.# merovote_app
