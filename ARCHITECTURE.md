# SplitMate Architecture & Technical Design

## System Architecture

### High-Level Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Mobile    │         │   Gemini     │         │   Gemini    │
│     App     │─────────│    Proxy     │─────────│     AI      │
│  (Client)   │  HTTPS  │   Server     │   API   │   Service   │
└─────────────┘         └──────────────┘         └─────────────┘
                                │
                                │
                        ┌───────▼──────┐
                        │    Redis     │
                        │    Queue     │
                        └──────────────┘
```

### Component Breakdown

#### Mobile App (React Native + Expo)

- **Framework**: Expo managed workflow
- **Language**: TypeScript
- **State Management**:
  - Zustand for local UI state (people, current invoice)
  - React Query for server state (scans, uploads)
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (TailwindCSS for React Native)

#### Gemini Proxy Server (Node.js + Express)

- **Purpose**: Secure intermediary for Gemini API calls
- **Features**:
  - File upload validation
  - Async job processing
  - Retry logic with exponential backoff
  - Rate limiting (TODO: Redis-based)
  - Push notification triggers

#### Storage & Persistence

- **Mobile**: AsyncStorage for upload queue
- **Server**: In-memory Map (production: Redis)

---

## Data Flow

### 1. Receipt Upload

```
User takes photo → File picker → Validate (size, type)
                                      ↓
                                 Add to queue
                                      ↓
                            useUpload hook processes
                                      ↓
                            API: POST /api/scan
                                      ↓
                            Returns scanJobId
                                      ↓
                           Server queues job
                                      ↓
                        Worker processes with Gemini
                                      ↓
                     Updates job status (queued/scanning/scanned/failed)
```

### 2. Polling for Results

```
App polls GET /api/scan/:id every 2-3s while status = queued/scanning
                                      ↓
                         Status becomes "scanned"
                                      ↓
                       App receives parsed items
                                      ↓
                  Creates Invoice with items
                                      ↓
                       Navigates to split screen
```

---

## Retry Strategy

### Client-Side Upload Retry

**Configuration**:

```typescript
{
  maxAttempts: 4,
  initialDelayMs: 500,
  factor: 2,
  jitter: true
}
```

**Delays**:

- Attempt 1: 500ms (250-500ms with jitter)
- Attempt 2: 1000ms (500-1000ms with jitter)
- Attempt 3: 2000ms (1000-2000ms with jitter)
- Attempt 4: 4000ms (2000-4000ms with jitter)

**Retryable Errors**:

- Network errors (`NETWORK_ERROR`)
- Rate limiting (`429`)
- Server errors (`5xx`)
- Gemini timeout (`GEMINI_TIMEOUT`)

**Non-Retryable Errors**:

- File too large (`413`)
- Unsupported file type (`415`)
- Parse failure (`PARSE_FAILED`)

### Server-Side Gemini Retry

**Configuration**:

```javascript
{
  maxRetries: 3,
  timeout: 30000,  // 30s per attempt
  retryDelay: 1000,
  retryFactor: 2
}
```

**Process**:

1. Call Gemini with 30s timeout
2. If timeout or error → Wait 1s → Retry
3. If still fails → Wait 2s → Retry
4. If still fails → Wait 4s → Final retry
5. Mark as `failed` if all attempts exhausted

---

## Error Handling

### Error Codes & User Messages

| Code               | Status | User Message                                                                             | Retryable |
| ------------------ | ------ | ---------------------------------------------------------------------------------------- | --------- |
| `NETWORK_ERROR`    | -      | "Upload failed — Check connection."                                                      | ✅        |
| `RATE_LIMITED`     | 429    | "Service busy — we'll resume automatically."                                             | ✅        |
| `SERVER_ERROR`     | 5xx    | "Server error. Please try again later."                                                  | ✅        |
| `FILE_TOO_LARGE`   | 413    | "This file is too large. Try a file under 10 MB."                                        | ❌        |
| `FILE_UNSUPPORTED` | 415    | "This file isn't supported. Try a JPG, PNG, or PDF under 10 MB."                         | ❌        |
| `GEMINI_TIMEOUT`   | -      | "Scanning is taking longer than expected. We'll retry automatically."                    | ✅        |
| `PARSE_FAILED`     | -      | "We couldn't extract invoice data automatically. Please verify or enter the key fields." | ❌        |

### Error Recovery Flow

```
Error occurs
    ↓
createScanError() determines:
    - Error code
    - User message
    - Retryable flag
    ↓
If retryable:
    - Calculate backoff delay
    - Update UI: "Retrying..."
    - Retry upload
    ↓
If non-retryable OR max attempts:
    - Show ErrorBanner
    - User can manually retry or dismiss
    - Can enter items manually
```

---

## State Management

### Zustand (Local State)

```typescript
interface InvoiceState {
  currentInvoice: Invoice | null;
  people: string[];

  // Actions
  addPerson(name: string): void;
  updateItem(index: number, item: Partial<Item>): void;
  togglePersonForItem(itemIndex: number, personName: string): void;
  calculateTotals(): void;
}
```

**Why Zustand?**

- Lightweight (< 1KB)
- Simple API
- No boilerplate
- Works great with hooks

### React Query (Server State)

```typescript
// Queries
useQuery(["scan", scanJobId], () => apiService.getScanStatus(scanJobId), {
  refetchInterval: status === "queued" || status === "scanning" ? 2000 : false,
  retry: 3,
});

// Mutations
useMutation((file) => apiService.uploadReceipt(file), {
  onSuccess: (data) => {
    // Start polling
  },
  onError: (error) => {
    // Show error
  },
});
```

**Why React Query?**

- Automatic retry with exponential backoff
- Built-in caching
- Polling support
- Loading & error states

---

## Security Considerations

### Mobile App

1. **No secrets in code** - API keys only on server
2. **HTTPS only** - Enforce in production
3. **Input validation** - File size, type checked before upload
4. **Cancel tokens** - User can cancel uploads

### Server

1. **Environment variables** - Secrets in `.env` file
2. **File validation** - Whitelist MIME types
3. **Size limits** - 10MB max (configurable)
4. **Rate limiting** - TODO: Implement with Redis
5. **CORS** - Configure allowed origins
6. **Input sanitization** - Validate all inputs

### Production Checklist

- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting (Redis + Bull)
- [ ] Add authentication/authorization
- [ ] Enable CORS with specific origins only
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Implement request logging
- [ ] Add health check endpoints
- [ ] Set up CI/CD pipelines

---

## Scalability

### Current (MVP)

- In-memory job storage (Map)
- Single server instance
- Synchronous Gemini processing

### Production Recommendations

#### 1. Queue System (Redis + Bull)

```javascript
const Queue = require("bull");
const scanQueue = new Queue("scan-receipts", process.env.REDIS_URL);

// Producer (API endpoint)
app.post("/api/scan", async (req, res) => {
  const job = await scanQueue.add({ fileBuffer, scanJobId });
  res.json({ scanJobId });
});

// Worker (separate process)
scanQueue.process(async (job) => {
  await processGeminiScan(job.data);
});
```

#### 2. Horizontal Scaling

- Multiple server instances behind load balancer
- Shared Redis for queue and job status
- Separate worker processes for Gemini calls

#### 3. Database (PostgreSQL)

```sql
CREATE TABLE scan_jobs (
  id UUID PRIMARY KEY,
  status VARCHAR(20),
  file_url VARCHAR(255),
  result JSONB,
  error JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_status ON scan_jobs(status);
CREATE INDEX idx_created_at ON scan_jobs(created_at);
```

#### 4. File Storage (S3)

- Upload files to S3 instead of in-memory
- Pre-signed URLs for upload
- Automatic expiration after 24 hours

#### 5. Monitoring & Observability

```javascript
// Sentry for error tracking
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Prometheus for metrics
const promClient = require("prom-client");
const uploadCounter = new promClient.Counter({
  name: "receipts_uploaded_total",
  help: "Total receipts uploaded",
});
```

---

## Testing Strategy

### Unit Tests

- Retry logic (`retry.test.ts`)
- Error handling (`errorHandling.test.ts`)
- Hooks (`uploadHook.test.ts`)

### Integration Tests

- API endpoints (TODO)
- Gemini integration (TODO)
- Upload flow end-to-end (TODO)

### E2E Tests (Detox)

```javascript
describe("Receipt Upload Flow", () => {
  it("should upload and process receipt", async () => {
    await element(by.id("camera-button")).tap();
    await element(by.id("take-photo")).tap();
    await waitFor(element(by.text("Processing...")))
      .toBeVisible()
      .withTimeout(5000);
    await waitFor(element(by.text("Scanned")))
      .toBeVisible()
      .withTimeout(30000);
  });
});
```

---

## Performance Optimizations

### Mobile App

1. **Image compression** before upload (TODO)
2. **Lazy load** tab screens
3. **Memoize** expensive calculations
4. **Virtual lists** for long item lists
5. **Optimize bundle size** (hermes, metro optimization)

### Server

1. **Gemini batch processing** (if API supports)
2. **Connection pooling** for database
3. **Caching** frequent results
4. **CDN** for static assets
5. **Compression** middleware (gzip)

---

## Deployment Architecture

### Development

```
Mobile: Expo Go app
Server: localhost:3000
Database: SQLite (or in-memory)
```

### Staging

```
Mobile: Internal TestFlight
Server: Heroku/Railway (single dyno)
Database: Postgres Hobby
Redis: Hobby tier
```

### Production

```
Mobile: App Store/Play Store
Server: AWS ECS/Kubernetes (auto-scaling)
Database: RDS PostgreSQL (Multi-AZ)
Redis: ElastiCache (cluster mode)
CDN: CloudFront
Monitoring: DataDog/New Relic
```

---

## Future Enhancements

### Features

- [ ] Receipt history/archive
- [ ] Export to Venmo/PayPal
- [ ] Multi-currency support
- [ ] Receipt editing/correction UI
- [ ] Group management
- [ ] Notifications preferences
- [ ] Dark mode
- [ ] Accessibility improvements

### Technical

- [ ] Offline-first architecture
- [ ] Background sync
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Machine learning for better parsing
- [ ] OCR fallback (Tesseract.js)

---

## Contact & Support

For technical questions or issues, please open a GitHub issue or contact the development team.

**Documentation Version**: 1.0.0  
**Last Updated**: October 2025
