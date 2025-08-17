# ckPayment Frontend Testing Guide

## Frontend Testing Strategy Overview

### Testing Pyramid
```
                    E2E Tests (Few)
                 ┌─────────────────────┐
                 │   Integration Tests │  
              ┌─────────────────────────────┐
              │      Component Tests        │
           ┌─────────────────────────────────────┐
           │           Unit Tests              │
        ┌─────────────────────────────────────────┐
```

## Testing Stack & Tools

### Current Setup
- **Test Framework**: Vitest (configured in package.json)
- **Testing Library**: @testing-library/react + @testing-library/jest-dom
- **User Event**: @testing-library/user-event
- **Mocking**: Built-in Vitest mocks
- **Coverage**: Vitest coverage reports

### Additional Tools Needed
```bash
# Install additional testing dependencies
npm install --save-dev @testing-library/react-hooks
npm install --save-dev msw  # Mock Service Worker for API mocking
npm install --save-dev @dfinity/agent-test-utils  # IC testing utilities
```

## Frontend Testing Workflow

### 1. Development Testing Flow
```bash
# 1. Start development server
npm run dev

# 2. Run tests in watch mode during development
npm run test:watch

# 3. Run full test suite
npm test

# 4. Generate coverage report
npm run test:coverage

# 5. Run linting
npm run lint

# 6. Build for production
npm run build
```

### 2. CI/CD Testing Flow
```bash
# 1. Install dependencies
npm ci

# 2. Lint code
npm run lint

# 3. Run all tests with coverage
npm run test:coverage -- --run

# 4. Type checking
tsc --noEmit

# 5. Build production bundle
npm run build

# 6. Bundle size analysis (optional)
npm run build:analyze
```

## Testing Categories

### 1. Unit Tests
**What to Test:**
- Pure functions and utilities
- Custom hooks in isolation
- Service classes with mocked dependencies
- Type guards and validators

**Example Structure:**
```typescript
// src/utils/__tests__/format.test.ts
import { formatCurrency, formatDate } from '../format';

describe('formatCurrency', () => {
  it('formats bigint values correctly', () => {
    expect(formatCurrency(BigInt(1000000), 'ckBTC')).toBe('0.01 ckBTC');
  });

  it('handles zero values', () => {
    expect(formatCurrency(BigInt(0), 'ICP')).toBe('0 ICP');
  });
});
```

### 2. Service Tests
**What to Test:**
- Service class methods with mocked actors
- Error handling and response parsing
- Data transformation between canister and client formats

**Example Structure:**
```typescript
// src/services/__tests__/modal-service.test.ts
import { ModalService } from '../modal-service';
import { MockAgent } from '@dfinity/agent-test-utils';

// Mock the actor
jest.mock('../user-payment-idl', () => ({
  userPaymentCanisterIdlFactory: jest.fn(),
}));

describe('ModalService', () => {
  let service: ModalService;
  let mockActor: any;

  beforeEach(() => {
    service = new ModalService();
    mockActor = {
      create_modal_config: jest.fn(),
      list_my_modals: jest.fn(),
      get_modal_config: jest.fn(),
    };
  });

  it('creates modal successfully', async () => {
    mockActor.create_modal_config.mockResolvedValue({ Ok: 'modal_1' });
    
    const result = await service.createModal('test-canister', mockModalData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBe('modal_1');
  });

  it('handles errors correctly', async () => {
    mockActor.create_modal_config.mockResolvedValue({ 
      Err: 'Modal name cannot be empty' 
    });
    
    const result = await service.createModal('test-canister', mockModalData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Modal name cannot be empty');
  });
});
```

### 3. Hook Tests
**What to Test:**
- State management and updates
- Effect handling and cleanup
- Error states and recovery
- Loading states and race conditions

**Example Structure:**
```typescript
// src/hooks/__tests__/useModal.test.ts
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';
import { modalService } from '../../services/modal-service';

// Mock the service
jest.mock('../../services/modal-service');
const mockModalService = modalService as jest.Mocked<typeof modalService>;

describe('useModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModalService.initialize.mockResolvedValue(true);
    mockModalService.listModals.mockResolvedValue({ 
      success: true, 
      data: [] 
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: 'test-canister' })
    );
    
    expect(result.current.modals).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('fetches modals on mount', async () => {
    const mockModals = [{ modal_id: 'test', name: 'Test Modal' }];
    mockModalService.listModals.mockResolvedValue({ 
      success: true, 
      data: mockModals 
    });

    const { result } = renderHook(() => 
      useModal({ canisterId: 'test-canister' })
    );

    await act(async () => {
      await result.current.fetchModals();
    });

    expect(result.current.modals).toEqual(mockModals);
    expect(mockModalService.listModals).toHaveBeenCalledWith('test-canister');
  });

  it('handles errors gracefully', async () => {
    mockModalService.listModals.mockResolvedValue({ 
      success: false, 
      error: 'Network error' 
    });

    const { result } = renderHook(() => 
      useModal({ canisterId: 'test-canister' })
    );

    await act(async () => {
      await result.current.fetchModals();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.modals).toEqual([]);
  });
});
```

### 4. Component Tests
**What to Test:**
- Rendering with different props
- User interactions and event handlers
- State changes and side effects
- Accessibility requirements

**Example Structure:**
```typescript
// src/components/modal/__tests__/ModalConfigCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalConfigCard } from '../ModalConfigCard';
import type { ModalConfig } from '../../../types/modal';

const mockModal: ModalConfig = {
  modal_id: 'test-modal',
  name: 'Test Modal',
  description: 'A test modal',
  theme: {
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: 8,
    font_family: 'Inter, sans-serif',
  },
  payment_options: {
    allowed_tokens: ['ckBTC'],
    require_email: false,
    require_shipping: false,
    show_amount_breakdown: true,
    enable_tips: false,
  },
  branding: {
    company_name: 'Test Company',
  },
  redirect_urls: {
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  },
  is_active: true,
  created_at: BigInt(Date.now()),
  updated_at: BigInt(Date.now()),
};

describe('ModalConfigCard', () => {
  it('renders modal information correctly', () => {
    render(<ModalConfigCard modal={mockModal} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('A test modal')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = jest.fn();
    
    render(<ModalConfigCard modal={mockModal} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockModal);
  });

  it('displays correct status badge', () => {
    // Test active modal
    const { rerender } = render(<ModalConfigCard modal={mockModal} />);
    expect(screen.getByText('Active')).toHaveClass('bg-green-500');

    // Test inactive modal
    rerender(<ModalConfigCard modal={{ ...mockModal, is_active: false }} />);
    expect(screen.getByText('Inactive')).toHaveClass('bg-gray-500');
  });

  it('shows loading state correctly', () => {
    render(<ModalConfigCard modal={mockModal} isLoading={true} />);
    
    const card = screen.getByTestId('modal-config-card');
    expect(card).toHaveClass('opacity-50');
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('handles missing optional fields gracefully', () => {
    const minimalModal = {
      ...mockModal,
      description: undefined,
    };

    render(<ModalConfigCard modal={minimalModal} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.queryByText('A test modal')).not.toBeInTheDocument();
  });
});
```

### 5. Integration Tests
**What to Test:**
- Component interaction with hooks and services
- Full user workflows
- Error boundaries and recovery
- Real API integration (with test canisters)

**Example Structure:**
```typescript
// src/components/modal/__tests__/ModalDashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalDashboard } from '../ModalDashboard';
import { modalService } from '../../../services/modal-service';

// Mock the service but allow some real calls
jest.mock('../../../services/modal-service', () => ({
  modalService: {
    initialize: jest.fn().mockResolvedValue(true),
    listModals: jest.fn(),
    createModal: jest.fn(),
    deleteModal: jest.fn(),
  },
}));

describe('ModalDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays modals after loading', async () => {
    const mockModals = [
      { modal_id: 'modal-1', name: 'Modal 1', is_active: true },
      { modal_id: 'modal-2', name: 'Modal 2', is_active: false },
    ];

    (modalService.listModals as jest.Mock).mockResolvedValue({
      success: true,
      data: mockModals,
    });

    render(<ModalDashboard canisterId="test-canister" />);

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for modals to load
    await waitFor(() => {
      expect(screen.getByText('Modal 1')).toBeInTheDocument();
      expect(screen.getByText('Modal 2')).toBeInTheDocument();
    });

    // Should not show loading anymore
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('handles modal creation workflow', async () => {
    const user = userEvent.setup();
    
    (modalService.listModals as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
    
    (modalService.createModal as jest.Mock).mockResolvedValue({
      success: true,
      data: 'new-modal-id',
    });

    render(<ModalDashboard canisterId="test-canister" />);

    // Click create button
    const createButton = await screen.findByRole('button', { name: /create modal/i });
    await user.click(createButton);

    // Fill form
    await user.type(screen.getByLabelText(/modal name/i), 'Test Modal');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.type(screen.getByLabelText(/success url/i), 'https://example.com/success');
    await user.type(screen.getByLabelText(/cancel url/i), 'https://example.com/cancel');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Verify service was called
    await waitFor(() => {
      expect(modalService.createModal).toHaveBeenCalledWith('test-canister', expect.objectContaining({
        name: 'Test Modal',
        branding: expect.objectContaining({
          company_name: 'Test Company',
        }),
      }));
    });
  });

  it('displays error messages appropriately', async () => {
    (modalService.listModals as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Network connection failed',
    });

    render(<ModalDashboard canisterId="test-canister" />);

    await waitFor(() => {
      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    });

    // Should have retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
```

## Testing Configuration Files

### 1. Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2. Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock crypto for tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock fetch for tests
global.fetch = vi.fn();

// Console error mock (to avoid noise in tests)
const originalError = console.error;
console.error = vi.fn((...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
    return;
  }
  originalError.apply(console, args);
});
```

### 3. Package.json Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

## Testing Best Practices

### 1. Test Organization
```
src/
├── components/
│   ├── modal/
│   │   ├── __tests__/
│   │   │   ├── ModalConfigCard.test.tsx
│   │   │   ├── ModalBuilder.test.tsx
│   │   │   └── ModalDashboard.integration.test.tsx
│   │   ├── ModalConfigCard.tsx
│   │   └── ModalBuilder.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useModal.test.ts
│   └── useModal.ts
├── services/
│   ├── __tests__/
│   │   └── modal-service.test.ts
│   └── modal-service.ts
└── test/
    ├── setup.ts
    ├── mocks/
    │   ├── modal-service.ts
    │   └── canister-actors.ts
    └── utils/
        ├── test-utils.tsx
        └── mock-data.ts
```

### 2. Mock Strategies

#### Service Mocking
```typescript
// src/test/mocks/modal-service.ts
export const mockModalService = {
  initialize: jest.fn().mockResolvedValue(true),
  createModal: jest.fn(),
  listModals: jest.fn(),
  updateModal: jest.fn(),
  deleteModal: jest.fn(),
  generateEmbedCode: jest.fn(),
  validateModalConfig: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
};
```

#### Component Wrapper
```typescript
// src/test/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 3. Test Data Management
```typescript
// src/test/utils/mock-data.ts
import type { ModalConfig, ModalAnalytics } from '../../types/modal';

export const mockModalConfig: ModalConfig = {
  modal_id: 'test-modal-1',
  name: 'Test Modal',
  description: 'A test modal for unit tests',
  theme: {
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: 8,
    font_family: 'Inter, sans-serif',
  },
  payment_options: {
    allowed_tokens: ['ckBTC', 'ICP'],
    require_email: false,
    require_shipping: false,
    show_amount_breakdown: true,
    enable_tips: false,
  },
  branding: {
    company_name: 'Test Company',
    logo_url: 'https://example.com/logo.png',
    support_url: 'https://example.com/support',
  },
  redirect_urls: {
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    webhook_url: 'https://example.com/webhook',
  },
  is_active: true,
  created_at: BigInt(Date.now() - 86400000),
  updated_at: BigInt(Date.now()),
};

export const mockModalAnalytics: ModalAnalytics = {
  modal_id: 'test-modal-1',
  total_views: BigInt(150),
  successful_payments: BigInt(23),
  conversion_rate: 15.33,
  revenue_generated: BigInt(450000000),
};

export const createMockModal = (overrides: Partial<ModalConfig> = {}): ModalConfig => ({
  ...mockModalConfig,
  ...overrides,
});
```

## Testing Checklist

### Before Committing
- [ ] All unit tests pass
- [ ] Service tests with mocked dependencies pass
- [ ] Hook tests cover all state changes
- [ ] Component tests cover user interactions
- [ ] Integration tests cover main workflows
- [ ] No console errors in tests
- [ ] Coverage meets threshold (80%+)

### Before Deploying
- [ ] All tests pass in CI environment
- [ ] Integration tests with real canisters pass
- [ ] Performance tests meet benchmarks
- [ ] Accessibility tests pass
- [ ] Cross-browser compatibility verified
- [ ] Bundle size analysis acceptable

### Testing Commands Summary
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- ModalService

# Run tests matching pattern
npm test -- --grep "modal creation"

# Update snapshots
npm test -- --update-snapshots
```

This testing guide ensures comprehensive coverage of all frontend functionality while maintaining development velocity.
