# SplitMate

A mobile app for splitting bills and receipts with AI-powered receipt scanning.

## Project Structure

```
split-mate-mobile/
├── split-mate-app/     # React Native mobile application
│   ├── app/            # Expo Router pages
│   ├── src/            # Source code (components, services, etc.)
│   └── package.json
│
└── split-mate-api/     # Express.js backend API
    ├── config/         # Configuration
    ├── middleware/     # Express middleware
    ├── routes/         # API routes
    ├── services/       # Business logic
    └── package.json
```

## Quick Start

### Mobile App Setup

```bash
cd split-mate-app
npm install
npx expo start
```

See [split-mate-app/README.md](split-mate-app/README.md) for detailed instructions.

### Backend API Setup

```bash
cd split-mate-api
npm install
npm start
```

See [split-mate-api/README.md](split-mate-api/README.md) for detailed instructions.

## Development

### Running Both Locally

**Terminal 1 - Backend:**
```bash
cd split-mate-api
npm start
```

**Terminal 2 - Mobile App:**
```bash
cd split-mate-app
npx expo start
```

## Documentation

- Mobile App: See [split-mate-app/](split-mate-app/)
- Backend API: See [split-mate-api/](split-mate-api/)

## Environment Variables

Each project has its own `.env` file:
- `split-mate-app/.env` - Mobile app configuration
- `split-mate-api/.env` - Backend API configuration

Copy the `.env.example` files in each folder to get started.