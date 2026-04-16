# Recurrly

Recurrly is an Expo app for tracking recurring payments and subscription activity.

## Getting Started

1. Install dependencies.

   ```bash
   npm install
   ```

2. Provide the Clerk publishable key.

   Create a local `.env` file from the checked-in template and add your real Clerk key there, or export the variable in your shell before starting the app:

   ```bash
   cp .env.example .env
   ```

   Set:

   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_real_clerk_publishable_key
   ```

   The real `.env` file is intentionally not tracked. Do not commit real secrets to the repository.

3. Start the app.

   ```bash
   npx expo start
   ```

In the output, you can open the project in a development build, Android emulator, iOS simulator, or Expo Go.

## Environment And Secrets

- `.env.example` documents the required environment variable with a placeholder value only.
- `.env` is gitignored and must remain untracked going forward.
- Local development should use an untracked `.env` file or shell environment variables.
- CI must inject `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` through the CI provider's secret manager or environment configuration, not from a committed file.

## Reset The Starter App

If you want to reset the starter app structure:

```bash
npm run reset-project
```

This moves the starter code to `app-example` and creates a blank `app` directory.

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [Clerk Expo documentation](https://clerk.com/docs/quickstarts/expo)
