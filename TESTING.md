# Testing Guide

## Overview

This guide covers testing strategies for Fin-AI-Copilot to ensure reliability and quality.

## Testing Stack

### Recommended Tools

```bash
# Install testing dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  jest-environment-jsdom \
  @next/env
```

## Configuration

### Jest Setup

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

## Unit Tests

### Testing Components

Create `src/components/__tests__/Composer.test.js`:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Composer from '../Composer';

describe('Composer', () => {
  const mockOnSend = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders composer with input', () => {
    render(<Composer onSendMessage={mockOnSend} />);
    
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
  
  test('sends message on button click', async () => {
    const user = userEvent.setup();
    render(<Composer onSendMessage={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello World');
    await user.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello World', []);
    expect(input).toHaveValue('');
  });
  
  test('sends message with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    render(<Composer onSendMessage={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    
    await user.type(input, 'Test message');
    await user.keyboard('{Control>}{Enter}{/Control}');
    
    expect(mockOnSend).toHaveBeenCalledWith('Test message', []);
  });
  
  test('adds emoji to message', async () => {
    const user = userEvent.setup();
    render(<Composer onSendMessage={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const emojiButton = screen.getByLabelText(/add emoji/i);
    
    await user.type(input, 'Hello ');
    await user.click(emojiButton);
    
    // Click first emoji
    const firstEmoji = screen.getByText('😊');
    await user.click(firstEmoji);
    
    expect(input).toHaveValue('Hello 😊');
  });
  
  test('validates file upload size', async () => {
    const user = userEvent.setup();
    render(<Composer onSendMessage={mockOnSend} />);
    
    const fileInput = screen.getByLabelText(/attach file/i);
    
    // Create file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    
    await user.upload(fileInput, largeFile);
    
    expect(screen.getByText(/file.*too large/i)).toBeInTheDocument();
  });
  
  test('disables send button when empty', () => {
    render(<Composer onSendMessage={mockOnSend} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
});
```

### Testing Utilities

Create `src/utils/__tests__/storage.test.js`:

```javascript
import {
  saveConversations,
  loadConversations,
  saveMessage,
  clearStorage,
} from '../storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('saves and loads conversations', () => {
    const conversations = [
      { id: 1, name: 'Test', messages: [] },
      { id: 2, name: 'Test 2', messages: [] },
    ];
    
    saveConversations(conversations);
    const loaded = loadConversations();
    
    expect(loaded).toEqual(conversations);
  });
  
  test('returns empty array when no data', () => {
    const loaded = loadConversations();
    expect(loaded).toEqual([]);
  });
  
  test('saves message to existing conversation', () => {
    const conversations = [
      { id: 1, name: 'Test', messages: [] },
    ];
    
    saveConversations(conversations);
    
    const newMessage = { id: 1, text: 'Hello', sender: 'user' };
    saveMessage(1, newMessage);
    
    const updated = loadConversations();
    expect(updated[0].messages).toContainEqual(newMessage);
  });
  
  test('clears all storage', () => {
    saveConversations([{ id: 1, name: 'Test', messages: [] }]);
    clearStorage();
    
    expect(localStorage.clear).toHaveBeenCalled();
  });
  
  test('handles malformed data gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json{');
    
    const loaded = loadConversations();
    expect(loaded).toEqual([]);
  });
});
```

### Testing API Calls

Create `src/utils/__tests__/claudeApi.test.js`:

```javascript
import { generateResponse, summarizeConversation } from '../claudeApi';

describe('Claude API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });
  
  test('generates response successfully', async () => {
    const mockResponse = [{ generated_text: 'Hello! How can I help?' }];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    const conversation = [
      { sender: 'user', text: 'Hello' },
    ];
    
    const response = await generateResponse(conversation);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    
    expect(response).toBe('Hello! How can I help?');
  });
  
  test('retries on model loading', async () => {
    // First call returns loading
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Model is loading' }),
    });
    
    // Second call succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ generated_text: 'Response' }],
    });
    
    const response = await generateResponse([]);
    
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(response).toBe('Response');
  });
  
  test('throws error after max retries', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Model is loading' }),
    });
    
    await expect(generateResponse([])).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
  
  test('summarizes conversation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ generated_text: 'Summary: Discussion about testing' }],
    });
    
    const messages = [
      { sender: 'user', text: 'How do I test?' },
      { sender: 'ai', text: 'Use Jest and React Testing Library' },
    ];
    
    const summary = await summarizeConversation(messages);
    
    expect(summary).toContain('testing');
  });
});
```

## Integration Tests

### Testing Page Components

Create `src/app/__tests__/page.test.js`:

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import * as claudeApi from '@/utils/claudeApi';

jest.mock('@/utils/claudeApi');

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  test('renders main layout', () => {
    render(<Home />);
    
    expect(screen.getByText(/inbox/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });
  
  test('sends message and gets AI response', async () => {
    const user = userEvent.setup();
    
    claudeApi.generateResponse.mockResolvedValue('AI response here');
    
    render(<Home />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello AI');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/AI response here/i)).toBeInTheDocument();
    });
  });
  
  test('persists conversations to localStorage', async () => {
    const user = userEvent.setup();
    
    claudeApi.generateResponse.mockResolvedValue('Response');
    
    render(<Home />);
    
    await user.type(screen.getByPlaceholderText(/type your message/i), 'Test');
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'conversations',
        expect.any(String)
      );
    });
  });
  
  test('loads saved conversations on mount', () => {
    const savedConversations = [
      {
        id: 1,
        name: 'Test User',
        messages: [{ sender: 'user', text: 'Hello' }],
      },
    ];
    
    localStorage.getItem.mockReturnValue(JSON.stringify(savedConversations));
    
    render(<Home />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## E2E Tests

### Playwright Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Create `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

Create `e2e/chat.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test('sends and receives messages', async ({ page }) => {
    await page.goto('/');
    
    // Type message
    await page.fill('[placeholder*="type your message"]', 'Hello AI');
    await page.click('button:has-text("Send")');
    
    // Wait for user message
    await expect(page.locator('text=Hello AI')).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('.ai-message')).toBeVisible({ timeout: 10000 });
  });
  
  test('adds emoji to message', async ({ page }) => {
    await page.goto('/');
    
    // Open emoji picker
    await page.click('[aria-label*="emoji"]');
    
    // Select emoji
    await page.click('text=😊');
    
    // Check emoji in input
    const input = page.locator('[placeholder*="type your message"]');
    await expect(input).toHaveValue('😊');
  });
  
  test('attaches files', async ({ page }) => {
    await page.goto('/');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image data'),
    });
    
    // Check file preview
    await expect(page.locator('.file-preview')).toBeVisible();
    await expect(page.locator('text=test.jpg')).toBeVisible();
  });
  
  test('searches conversations', async ({ page }) => {
    await page.goto('/');
    
    // Type in search
    await page.fill('[placeholder*="Search"]', 'support');
    
    // Check filtered results
    await expect(page.locator('.conversation-item')).toHaveCount(1);
  });
  
  test('persists data after refresh', async ({ page }) => {
    await page.goto('/');
    
    // Send message
    await page.fill('[placeholder*="type your message"]', 'Test persistence');
    await page.click('button:has-text("Send")');
    
    // Wait for message to appear
    await expect(page.locator('text=Test persistence')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Check message still exists
    await expect(page.locator('text=Test persistence')).toBeVisible();
  });
});
```

## Accessibility Tests

### Install axe-core

```bash
npm install --save-dev @axe-core/playwright
```

Create `e2e/accessibility.spec.js`:

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('placeholder', /search/i);
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Continue tabbing to message input
    
    await expect(page.locator(':focus')).toHaveAttribute('placeholder', /type your message/i);
  });
});
```

## Visual Regression Tests

### Install Percy

```bash
npm install --save-dev @percy/cli @percy/playwright
```

Create `e2e/visual.spec.js`:

```javascript
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Tests', () => {
  test('home page looks correct', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'Home Page');
  });
  
  test('chat with messages looks correct', async ({ page }) => {
    await page.goto('/');
    
    // Add some test data
    await page.evaluate(() => {
      localStorage.setItem('conversations', JSON.stringify([
        {
          id: 1,
          name: 'Test User',
          messages: [
            { sender: 'user', text: 'Hello' },
            { sender: 'ai', text: 'Hi there!' },
          ],
        },
      ]));
    });
    
    await page.reload();
    await percySnapshot(page, 'Chat with Messages');
  });
});
```

## Performance Tests

### Lighthouse CI

Create `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Test Coverage

### Run Coverage

```bash
npm test -- --coverage
```

### Coverage Reports

View in terminal or open `coverage/lcov-report/index.html` in browser.

### Coverage Targets

- **Statements:** > 70%
- **Branches:** > 70%
- **Functions:** > 70%
- **Lines:** > 70%

## Continuous Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Best Practices

1. **Write tests first** (TDD) when fixing bugs
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Avoid test interdependencies**
6. **Mock external dependencies**
7. **Test error cases**
8. **Maintain high coverage**
9. **Run tests before committing**
10. **Review tests in code review**

## Test Checklist

- [ ] Unit tests for all components
- [ ] Unit tests for all utilities
- [ ] Integration tests for page flows
- [ ] E2E tests for critical paths
- [ ] Accessibility tests
- [ ] Performance tests
- [ ] Visual regression tests
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Coverage > 70%

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
