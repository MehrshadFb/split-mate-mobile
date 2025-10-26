# Testing Guide - SplitMate Mobile

## Testing Strategy

SplitMate uses a comprehensive testing approach with unit tests, integration tests, and manual acceptance testing.

---

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode (recommended during development)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- retry.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should retry"
```

### Expected Output

```
PASS  __tests__/retry.test.ts
PASS  __tests__/errorHandling.test.ts
PASS  __tests__/uploadHook.test.ts

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.456s
```

---

## Test Coverage Goals

| Category   | Target | Current |
| ---------- | ------ | ------- |
| Statements | 80%    | TBD     |
| Branches   | 75%    | TBD     |
| Functions  | 80%    | TBD     |
| Lines      | 80%    | TBD     |

---

## Unit Test Examples

### 1. Retry Logic Test

```typescript
// __tests__/retry.test.ts
it("should calculate correct backoff delay with jitter", () => {
  const config = DEFAULT_RETRY_CONFIG;
  const delays = [];

  for (let i = 0; i < 4; i++) {
    delays.push(calculateBackoffDelay(i, config));
  }

  // Verify delays are in expected ranges
  expect(delays[0]).toBeGreaterThanOrEqual(250);
  expect(delays[0]).toBeLessThanOrEqual(500);

  expect(delays[1]).toBeGreaterThanOrEqual(500);
  expect(delays[1]).toBeLessThanOrEqual(1000);
});
```

### 2. Error Handling Test

```typescript
// __tests__/errorHandling.test.ts
it("should create appropriate error for rate limiting", () => {
  const error = createScanError({ message: "Too many requests" }, 429);

  expect(error.code).toBe("RATE_LIMITED");
  expect(error.userMessage).toBe(ErrorMessages.RATE_LIMITED);
  expect(error.retryable).toBe(true);
});
```

### 3. Upload Hook Test

```typescript
// __tests__/uploadHook.test.ts
it("should persist queue to AsyncStorage", async () => {
  const { result } = renderHook(() => useUpload());

  act(() => {
    result.current.addToQueue(
      "file://test.jpg",
      "test.jpg",
      1024,
      "image/jpeg"
    );
  });

  await waitFor(() => {
    expect(storage.saveUploadQueue).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fileName: "test.jpg" }),
      ])
    );
  });
});
```

---

## Manual Testing Checklist

### Setup Flow

- [ ] App launches successfully
- [ ] Setup screen appears first
- [ ] Can add person name
- [ ] Person appears in list with avatar
- [ ] Can remove person
- [ ] Continue button disabled until 2+ people
- [ ] Continue button enabled with 2+ people
- [ ] Navigate to upload screen

### Upload Flow

- [ ] Upload screen shows after setup
- [ ] Camera button requests permissions
- [ ] Can take photo with camera
- [ ] Photo appears in preview
- [ ] Upload starts automatically
- [ ] Progress bar shows percentage
- [ ] Can cancel upload mid-process
- [ ] Can choose from library
- [ ] File picker opens
- [ ] Selected image uploads
- [ ] Manual entry button works
- [ ] Navigates to split screen

### Error Scenarios

- [ ] Large file (>10MB) shows error
- [ ] Unsupported file type shows error
- [ ] Network offline shows retry
- [ ] Failed upload shows error banner
- [ ] Retry button works
- [ ] Attempt count displays
- [ ] Queue persists after app restart

### Split Flow

- [ ] Items display correctly
- [ ] Can edit item name
- [ ] Can edit item price
- [ ] Can delete item
- [ ] Confirm dialog on delete
- [ ] Can toggle person for item
- [ ] Person pills highlight when selected
- [ ] Totals calculate correctly
- [ ] Total amount is accurate
- [ ] Can add new items
- [ ] Split persists between screens

### Edge Cases

- [ ] 0 items - shows empty state
- [ ] 1 person - cannot continue
- [ ] Very long names - truncate properly
- [ ] Large number of items - scrolls
- [ ] Decimal prices - formats correctly
- [ ] Negative prices - prevented
- [ ] Special characters in names - handled

---

## Acceptance Criteria

### User Story 1: Setup People

```
As a user
I want to add people who are splitting the bill
So that I can assign items to them later

Acceptance Criteria:
✅ Can add 2+ people with names
✅ Names are required (no empty names)
✅ Can remove people from list
✅ Cannot continue without 2+ people
✅ Names persist when navigating away
```

### User Story 2: Upload Receipt

```
As a user
I want to upload a receipt photo
So that the app can automatically extract items

Acceptance Criteria:
✅ Can take photo with camera
✅ Can select from photo library
✅ Upload progress is visible
✅ Can cancel upload
✅ Errors are clearly communicated
✅ Failed uploads can be retried
✅ Queue persists across app restarts
```

### User Story 3: Split Items

```
As a user
I want to assign items to specific people
So that we can calculate fair shares

Acceptance Criteria:
✅ See all items with prices
✅ Can toggle people for each item
✅ Can edit item details
✅ Totals update automatically
✅ Can see who owes what
✅ Can add items manually
```

---

## Integration Testing

### API Integration Test

```typescript
describe("Gemini Proxy Integration", () => {
  it("should upload and process receipt", async () => {
    const file = createTestFile();

    // Upload
    const uploadResponse = await apiService.uploadReceipt(
      file.uri,
      file.name,
      file.size,
      file.mimeType
    );

    expect(uploadResponse.scanJobId).toBeDefined();

    // Poll for result
    let attempts = 0;
    let status = "queued";

    while (status === "queued" && attempts < 30) {
      const statusResponse = await apiService.getScanStatus(
        uploadResponse.scanJobId
      );
      status = statusResponse.status;

      if (status === "scanned") {
        expect(statusResponse.result.items).toBeInstanceOf(Array);
        expect(statusResponse.result.items.length).toBeGreaterThan(0);
        break;
      }

      await sleep(1000);
      attempts++;
    }

    expect(status).toBe("scanned");
  });
});
```

---

## Performance Testing

### Load Testing (Server)

```bash
# Install Apache Bench
brew install apache2

# Test upload endpoint
ab -n 100 -c 10 -p receipt.jpg -T multipart/form-data \
  http://localhost:3000/api/scan

# Expected results:
# Requests per second: > 50
# Time per request: < 200ms (mean)
# Failed requests: 0
```

### Memory Profiling (Mobile)

```typescript
// Monitor memory usage
import { Platform } from "react-native";

if (__DEV__) {
  setInterval(() => {
    if (Platform.OS === "ios") {
      console.log("Memory:", performance.memory.usedJSHeapSize / 1048576, "MB");
    }
  }, 5000);
}
```

---

## Accessibility Testing

### Manual Checklist

- [ ] VoiceOver (iOS) can navigate all screens
- [ ] TalkBack (Android) reads all elements
- [ ] Touch targets are at least 44x44 pts
- [ ] Color contrast meets WCAG AA
- [ ] No text smaller than 11pt
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Errors are announced

### Automated Testing

```typescript
import { axe } from "@axe-core/react-native";

it("should not have accessibility violations", async () => {
  const { container } = render(<UploadScreen />);
  const results = await axe(container);

  expect(results.violations).toHaveLength(0);
});
```

---

## Regression Testing

### Before Each Release

1. Run full test suite (`npm test`)
2. Manual testing checklist (above)
3. Test on iOS and Android
4. Test on different device sizes
5. Test with slow network (throttle)
6. Test offline mode
7. Test with large receipts (10+ items)
8. Test with edge case data

---

## Continuous Integration

### GitHub Actions

- Runs on every push
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Jest)
- Coverage report
- Build verification

### Pre-commit Hooks

```bash
# Install Husky
npm install --save-dev husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm test"
```

---

## Bug Reporting Template

```markdown
## Bug Report

**Description**
[Clear description of the bug]

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
[What should happen]

**Actual Behavior**
[What actually happens]

**Screenshots**
[If applicable]

**Environment**

- Device: [e.g., iPhone 14 Pro]
- OS: [e.g., iOS 17.0]
- App Version: [e.g., 1.0.0]

**Logs**
[Relevant error messages or logs]
```

---

## Test Data

### Sample Receipts

- `test-fixtures/receipt-simple.jpg` - 3 items
- `test-fixtures/receipt-complex.jpg` - 15 items with tax
- `test-fixtures/receipt-blurry.jpg` - Low quality
- `test-fixtures/receipt-large.jpg` - 20MB (should fail)
- `test-fixtures/receipt.pdf` - PDF format

### Test Users

```typescript
const testPeople = ["Alice", "Bob", "Charlie", "Diana"];

const testItems = [
  { name: "Coffee", price: 4.5 },
  { name: "Sandwich", price: 8.99 },
  { name: "Salad", price: 7.25 },
  { name: "Tax", price: 1.67 },
];
```

---

## Next Steps

1. ✅ Set up Jest configuration
2. ✅ Write unit tests
3. 🔄 Add integration tests (in progress)
4. 📋 Set up E2E tests (Detox)
5. 📋 Implement visual regression testing
6. 📋 Add performance benchmarks

---

For questions or issues with testing, please contact the development team or open a GitHub issue.
