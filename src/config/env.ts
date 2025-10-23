// Environment configuration
// For production, update API_URL to your Vercel deployment URL

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
}
