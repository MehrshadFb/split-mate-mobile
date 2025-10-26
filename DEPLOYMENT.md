# Deployment Guide - SplitMate Mobile

## Prerequisites

### Mobile App

- Apple Developer Account ($99/year) for iOS
- Google Play Developer Account ($25 one-time) for Android
- Expo account (free)
- EAS CLI installed (`npm install -g eas-cli`)

### Server

- Cloud platform account (Heroku, Railway, Render, etc.)
- Redis instance (for production queue)
- Gemini API key

---

## Step 1: Server Deployment

### Option A: Heroku

```bash
# Navigate to server directory
cd server/gemini-proxy

# Login to Heroku
heroku login

# Create app
heroku create splitmate-api

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production
heroku config:set MAX_FILE_SIZE_MB=10

# Create Procfile
echo "web: node index.js" > Procfile

# Initialize git and deploy
git init
git add .
git commit -m "Initial server deployment"
git push heroku main

# Verify deployment
heroku logs --tail
curl https://splitmate-api.herokuapp.com/health
```

### Option B: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add Redis plugin via Railway dashboard

# Set environment variables
railway variables set GEMINI_API_KEY=your_api_key
railway variables set NODE_ENV=production

# Deploy
railway up

# Get URL
railway domain
```

### Option C: Render

1. Go to https://render.com
2. New > Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd server/gemini-proxy && npm install`
   - Start Command: `cd server/gemini-proxy && npm start`
5. Add environment variables
6. Add Redis instance
7. Deploy

---

## Step 2: Mobile App Configuration

### Update API URL

```bash
# In project root, create .env
echo "EXPO_PUBLIC_API_URL=https://your-server-url.herokuapp.com" > .env
```

### Configure EAS

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# This creates eas.json with build profiles
```

### Update app.json

```json
{
  "expo": {
    "name": "SplitMate",
    "slug": "splitmate",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.splitmate",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "We need camera access to scan receipts",
        "NSPhotoLibraryUsageDescription": "We need photo library access to select receipts"
      }
    },
    "android": {
      "package": "com.yourcompany.splitmate",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## Step 3: iOS Deployment

### Build for TestFlight

```bash
# Create iOS build
eas build --platform ios --profile production

# This will:
# 1. Ask for Apple Developer credentials
# 2. Generate provisioning profiles
# 3. Build the app
# 4. Upload to Expo servers
```

### Submit to TestFlight

```bash
# Submit to App Store Connect
eas submit --platform ios

# You'll need:
# - Apple ID
# - App-specific password
# - 2FA enabled
```

### TestFlight Setup

1. Go to App Store Connect
2. Select your app
3. TestFlight tab
4. Add internal testers (up to 100)
5. Distribute build
6. Testers receive email with TestFlight link

### Requirements for App Store

- App icon (1024x1024)
- Screenshots (various sizes)
- Privacy policy URL
- App description
- Keywords
- Category

---

## Step 4: Android Deployment

### Build for Google Play

```bash
# Create Android build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Google Play Console Setup

1. Create app in Play Console
2. Fill out store listing:
   - Title, description
   - Screenshots
   - Feature graphic (1024x500)
   - App icon
3. Content rating questionnaire
4. Pricing & distribution
5. Submit for review

---

## Step 5: Push Notifications Setup

### Expo Push Notifications

```bash
# Get Expo push token in app
import * as Notifications from 'expo-notifications';

const token = (await Notifications.getExpoPushTokenAsync()).data;
// Send to your server
```

### Server Implementation

```javascript
// server/gemini-proxy/notifications.js
const axios = require("axios");

async function sendPushNotification(expoPushToken, scanJobId, status) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: status === "scanned" ? "Receipt Processed!" : "Scan Failed",
    body:
      status === "scanned"
        ? "Your receipt has been scanned successfully."
        : "Failed to process your receipt. Please try again.",
    data: { scanJobId, status },
  };

  await axios.post("https://exp.host/--/api/v2/push/send", message);
}
```

---

## Step 6: Monitoring & Analytics

### Sentry Setup

```bash
# Install Sentry
npm install @sentry/react-native

# Initialize in app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Analytics (Expo Analytics)

```typescript
import * as Analytics from "expo-analytics";

Analytics.logEvent("receipt_uploaded", {
  file_type: "jpg",
  file_size: 1024,
});
```

---

## Step 7: CI/CD Setup

### GitHub Actions (Already configured)

Add secrets to GitHub repository:

- `EXPO_TOKEN`: Expo authentication token
- Get token: `eas build:configure` and copy from eas.json

### Automated Builds

```bash
# On push to main branch
git push origin main

# GitHub Actions will:
# 1. Run linting
# 2. Run tests
# 3. Build iOS & Android
# 4. Upload to Expo
```

---

## Step 8: Post-Deployment Checklist

### Mobile App

- [ ] Update EXPO_PUBLIC_API_URL to production
- [ ] Test on physical devices (iOS & Android)
- [ ] Verify camera permissions work
- [ ] Test upload & retry flow
- [ ] Verify push notifications
- [ ] Test offline queue persistence
- [ ] Check error handling
- [ ] Verify analytics tracking

### Server

- [ ] Health check endpoint working
- [ ] Environment variables set
- [ ] Redis connected
- [ ] Gemini API key valid
- [ ] File upload limits enforced
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking (Sentry) set up
- [ ] HTTPS enforced
- [ ] CORS configured

### App Store / Play Store

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App icons uploaded
- [ ] Screenshots uploaded
- [ ] Store description written
- [ ] Keywords optimized
- [ ] Submitted for review

---

## Rollback Procedures

### Mobile App

```bash
# Revert to previous build
eas channel:edit production --branch previous-version
```

### Server

```bash
# Heroku rollback
heroku rollback

# Railway rollback
railway rollback

# Docker rollback
docker-compose up -d --scale app=0
docker-compose up -d previous-image
```

---

## Maintenance

### Regular Tasks

- Monitor error rates (Sentry)
- Check API usage (Gemini quota)
- Review user feedback
- Update dependencies monthly
- Security patches ASAP

### Scaling

- Monitor Redis memory usage
- Add server instances if needed
- Optimize slow queries
- Cache frequently accessed data

---

## Support & Troubleshooting

### Common Issues

**Build fails on EAS**

- Check `eas.json` configuration
- Verify Apple Developer credentials
- Ensure all dependencies are compatible

**Server 500 errors**

- Check Gemini API key
- Verify Redis connection
- Review server logs

**Upload fails**

- Verify EXPO_PUBLIC_API_URL is correct
- Check file size limits
- Test network connectivity

---

## Cost Estimates

### Development (Monthly)

- Expo: Free
- Heroku Hobby: $7
- Redis: $3
- Total: ~$10/month

### Production (Monthly)

- Heroku Professional: $25
- Redis Premium: $15
- Gemini API: Pay-per-use (~$20-50)
- Apple Developer: $8.25/month ($99/year)
- Sentry: Free tier or $29
- Total: ~$100-150/month

---

## Next Steps

1. Deploy server to production
2. Build and test on TestFlight
3. Submit to App Store
4. Monitor analytics and errors
5. Iterate based on user feedback

**Happy Deploying! 🚀**
