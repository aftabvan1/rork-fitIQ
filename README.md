# FitIQ - Fitness & Nutrition Tracking App

A comprehensive React Native app for tracking nutrition, workouts, and connecting with friends on your fitness journey.

## Features

- 📱 **Nutrition Tracking**: Log meals, scan barcodes, analyze food photos
- 💪 **Workout Logging**: Track exercises, sets, reps, and progress
- 👥 **Social Features**: Connect with friends, share progress
- 🤖 **AI Assistant**: Get personalized nutrition and fitness advice
- 📊 **Analytics**: Detailed progress tracking and insights
- 💳 **Premium Features**: Advanced analytics and AI features

## Backend Setup

This app requires a backend API to function properly. You have several options:

### Option 1: Use Environment Variables (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `EXPO_PUBLIC_API_URL` in your `.env` file:
   ```
   EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

### Option 2: Local Development Backend

If you're running a local backend server:

1. Set up your backend server on `http://localhost:3000`
2. Ensure your backend has the following endpoints:
   - `GET /api/health` - Health check
   - `POST /api/auth/login` - User login
   - `POST /api/auth/register` - User registration
   - `GET /api/user/profile` - Get user profile
   - `GET /api/nutrition/daily/:date` - Get daily nutrition
   - `POST /api/nutrition/meal-entry` - Add meal entry
   - And more... (see `services/api.ts` for full list)

### Option 3: Backend Service Providers

You can use services like:
- **Supabase** - For database and auth
- **Firebase** - For real-time features
- **Railway/Render** - For hosting your backend
- **Vercel/Netlify** - For serverless functions

## Required Backend Endpoints

Your backend should implement these endpoints:

```
GET    /api/health
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/profile-picture
GET    /api/food/search
GET    /api/food/barcode/:barcode
POST   /api/food/analyze-photo
GET    /api/nutrition/daily/:date
POST   /api/nutrition/meal-entry
PUT    /api/nutrition/meal-entry/:id
DELETE /api/nutrition/meal-entry/:id
GET    /api/workouts
POST   /api/workouts
PUT    /api/workouts/:id
DELETE /api/workouts/:id
GET    /api/exercises/templates
GET    /api/friends
GET    /api/friends/requests
POST   /api/friends/request
POST   /api/friends/request/:id/accept
POST   /api/friends/request/:id/reject
DELETE /api/friends/:id
GET    /api/friends/activities
GET    /api/subscription/status
POST   /api/subscription/create
POST   /api/subscription/cancel
POST   /api/ai/meal-suggestions
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. Set up your environment variables (see Backend Setup above)

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   # or
   bun start
   ```

## Development

- **iOS**: Press `i` to open iOS simulator
- **Android**: Press `a` to open Android emulator  
- **Web**: Press `w` to open in web browser

## Backend Status

The app includes a backend availability check. If the backend is not available:
- The app will show appropriate error messages
- Some features may fall back to demo/offline mode
- Users will be notified about connectivity issues

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.