# ckPayment Frontend Development Guide

## Frontend Architecture Overview

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS + shadcn/ui components  
- **State Management**: React Context + Custom Hooks
- **IC Integration**: @dfinity packages (agent, auth-client, candid, principal)
- **Forms**: react-hook-form + zod validation
- **Charts**: recharts
- **Build**: Vite (dashboard) + Webpack (SDK)

### Project Structure
```
ckPayment-web3/
├── src/
│   ├── components/           # Shared UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── modal/           # Modal builder components (NEW)
│   │   ├── subscription/    # Subscription management (NEW)
│   │   └── ui/             # shadcn/ui base components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # IC canister service classes
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
```

## Development Workflow

### Phase 1: Backend Integration
1. **Extract Types from Candid** - Generate TypeScript interfaces from .did files
2. **Create Service Class** - Implement canister interaction methods
3. **Create Custom Hooks** - React hooks for state management
4. **Build UI Components** - Create reusable components
5. **Integration Testing** - Test end-to-end functionality

### Phase 2: UI/UX Implementation  
1. **Design System Integration** - Follow shadcn/ui patterns
2. **Responsive Design** - Mobile-first approach
3. **Loading States** - Proper loading and error handling
4. **Form Validation** - Client-side validation with zod
5. **Accessibility** - WCAG compliance

### Phase 3: Testing & Deployment
1. **Unit Tests** - Component and hook testing
2. **Integration Tests** - Service layer testing  
3. **E2E Testing** - Full user workflow testing
4. **Performance Testing** - Bundle size and runtime optimization
5. **Deployment** - Build optimization and deployment

## Feature Development Patterns

### 1. Type Definition Pattern
```typescript
// src/types/subscription.ts
export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  description: string;
  price: bigint;
  token: string;
  billing_interval: BillingInterval;
  trial_period_days?: number;
  max_subscriptions?: number;
  features: string[];
  is_active: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export interface Subscription {
  subscription_id: string;
  plan_id: string;
  subscriber: Principal;
  status: SubscriptionStatus;
  current_period_start: bigint;
  current_period_end: bigint;
  next_billing_date: bigint;
  trial_end?: bigint;
  cancelled_at?: bigint;
  cancel_at_period_end: boolean;
  total_payments: bigint;
  payment_failures: number;
  metadata: [string, string][];
  created_at: bigint;
  updated_at: bigint;
}

export enum SubscriptionStatus {
  Active = 'Active',
  Paused = 'Paused',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  PendingPayment = 'PendingPayment',
}

export enum BillingInterval {
  Daily = 'Daily',
  Weekly = 'Weekly', 
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
  Custom = 'Custom',
}
```

### 2. Service Class Pattern
```typescript
// src/services/subscription-service.ts
import { Principal } from '@dfinity/principal';
import { createActor } from '../declarations/user_payment_canister';
import type { SubscriptionPlan, Subscription } from '../types/subscription';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SubscriptionService {
  private actor: any;
  
  constructor(private canisterId: string) {}
  
  async initialize(): Promise<void> {
    this.actor = await createActor(this.canisterId, {
      agentOptions: { host: 'https://ic0.app' }
    });
  }

  // CRUD Operations
  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'plan_id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<string>> {
    try {
      const result = await this.actor.create_subscription_plan(plan);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionPlans(): Promise<ServiceResponse<SubscriptionPlan[]>> {
    try {
      const result = await this.actor.list_subscription_plans();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSubscriptionPlan(planId: string, plan: SubscriptionPlan): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.update_subscription_plan(planId, plan);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.delete_subscription_plan(planId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Subscription Operations
  async createSubscription(planId: string, metadata: [string, string][]): Promise<ServiceResponse<string>> {
    try {
      const result = await this.actor.create_subscription(planId, metadata);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMySubscriptions(): Promise<ServiceResponse<Subscription[]>> {
    try {
      const result = await this.actor.list_my_subscriptions();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.pause_subscription(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.resume_subscription(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.cancel_subscription(subscriptionId, immediately);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper Methods
  private handleResult<T>(result: any): ServiceResponse<T> {
    if ('Ok' in result) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  }

  private handleError(error: any): ServiceResponse<never> {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### 3. Custom Hook Pattern  
```typescript
// src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../services/subscription-service';
import type { SubscriptionPlan, Subscription } from '../types/subscription';

interface UseSubscriptionState {
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

export const useSubscription = (canisterId: string) => {
  const [state, setState] = useState<UseSubscriptionState>({
    plans: [],
    subscriptions: [],
    loading: false,
    error: null,
  });

  const [service] = useState(() => new SubscriptionService(canisterId));

  useEffect(() => {
    service.initialize().catch(console.error);
  }, [service]);

  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));

  const setError = (error: string | null) => 
    setState(prev => ({ ...prev, error }));

  // Plan Operations
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getSubscriptionPlans();
      if (result.success) {
        setState(prev => ({ ...prev, plans: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch plans');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createPlan = useCallback(async (plan: Omit<SubscriptionPlan, 'plan_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.createSubscriptionPlan(plan);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  const updatePlan = useCallback(async (planId: string, plan: SubscriptionPlan) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.updateSubscriptionPlan(planId, plan);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true };
      } else {
        setError(result.error || 'Failed to update plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  const deletePlan = useCallback(async (planId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.deleteSubscriptionPlan(planId);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  // Subscription Operations
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getMySubscriptions();
      if (result.success) {
        setState(prev => ({ ...prev, subscriptions: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createSubscription = useCallback(async (planId: string, metadata: [string, string][] = []) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.createSubscription(planId, metadata);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create subscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  const pauseSubscription = useCallback(async (subscriptionId: string) => {
    const result = await service.pauseSubscription(subscriptionId);
    if (result.success) {
      await fetchSubscriptions();
    }
    return result;
  }, [service, fetchSubscriptions]);

  const resumeSubscription = useCallback(async (subscriptionId: string) => {
    const result = await service.resumeSubscription(subscriptionId);
    if (result.success) {
      await fetchSubscriptions();
    }
    return result;
  }, [service, fetchSubscriptions]);

  const cancelSubscription = useCallback(async (subscriptionId: string, immediately = false) => {
    const result = await service.cancelSubscription(subscriptionId, immediately);
    if (result.success) {
      await fetchSubscriptions();
    }
    return result;
  }, [service, fetchSubscriptions]);

  // Initialize data on mount
  useEffect(() => {
    Promise.all([fetchPlans(), fetchSubscriptions()]).catch(console.error);
  }, [fetchPlans, fetchSubscriptions]);

  return {
    ...state,
    // Plan operations
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    // Subscription operations
    fetchSubscriptions,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    // Utilities
    refresh: useCallback(() => {
      return Promise.all([fetchPlans(), fetchSubscriptions()]);
    }, [fetchPlans, fetchSubscriptions]),
  };
};
```

### 4. Component Pattern
```typescript
// src/components/subscription/SubscriptionPlanCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import type { SubscriptionPlan } from '@/types/subscription';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (planId: string) => void;
  onToggleStatus?: (planId: string) => void;
  isLoading?: boolean;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}) => {
  return (
    <Card className={`transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={plan.is_active ? 'success' : 'secondary'}>
              {plan.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {plan.trial_period_days && (
              <Badge variant="outline">
                {plan.trial_period_days} day trial
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="text-center py-4">
          <div className="text-3xl font-bold">
            {formatCurrency(plan.price, plan.token)}
          </div>
          <div className="text-sm text-muted-foreground">
            per {plan.billing_interval.toLowerCase()}
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold mb-2">Features:</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Limits */}
        {plan.max_subscriptions && (
          <div className="text-sm text-muted-foreground">
            Max subscriptions: {plan.max_subscriptions}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(plan)}
              disabled={isLoading}
            >
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(plan.plan_id)}
              disabled={isLoading}
            >
              {plan.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(plan.plan_id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## Testing Patterns

### 1. Component Testing
```typescript
// src/components/subscription/__tests__/SubscriptionPlanCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionPlanCard } from '../SubscriptionPlanCard';
import type { SubscriptionPlan } from '@/types/subscription';

const mockPlan: SubscriptionPlan = {
  plan_id: 'test-plan',
  name: 'Basic Plan',
  description: 'A basic subscription plan',
  price: BigInt(1000000),
  token: 'ckBTC',
  billing_interval: 'Monthly',
  trial_period_days: 7,
  max_subscriptions: 100,
  features: ['Feature 1', 'Feature 2'],
  is_active: true,
  created_at: BigInt(Date.now()),
  updated_at: BigInt(Date.now()),
};

describe('SubscriptionPlanCard', () => {
  it('renders plan information correctly', () => {
    render(<SubscriptionPlanCard plan={mockPlan} />);
    
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    expect(screen.getByText('A basic subscription plan')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('7 day trial')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<SubscriptionPlanCard plan={mockPlan} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockPlan);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<SubscriptionPlanCard plan={mockPlan} onDelete={mockOnDelete} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('test-plan');
  });

  it('shows loading state correctly', () => {
    const { container } = render(
      <SubscriptionPlanCard plan={mockPlan} isLoading={true} />
    );
    
    expect(container.firstChild).toHaveClass('opacity-50');
  });
});
```

### 2. Hook Testing
```typescript
// src/hooks/__tests__/useSubscription.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSubscription } from '../useSubscription';

// Mock the service
jest.mock('../services/subscription-service');

describe('useSubscription', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useSubscription('test-canister-id'));
    
    expect(result.current.plans).toEqual([]);
    expect(result.current.subscriptions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('fetches plans successfully', async () => {
    const { result } = renderHook(() => useSubscription('test-canister-id'));
    
    await act(async () => {
      await result.current.fetchPlans();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.plans.length).toBeGreaterThan(0);
  });
});
```

### 3. Service Testing
```typescript
// src/services/__tests__/subscription-service.test.ts
import { SubscriptionService } from '../subscription-service';

// Mock the actor
jest.mock('../../declarations/user_payment_canister');

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService('test-canister-id');
  });

  it('creates subscription plan successfully', async () => {
    const mockPlan = {
      name: 'Test Plan',
      description: 'A test plan',
      price: BigInt(1000000),
      token: 'ckBTC',
      billing_interval: 'Monthly',
      features: ['Feature 1'],
      is_active: true,
    };

    const result = await service.createSubscriptionPlan(mockPlan);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('handles errors correctly', async () => {
    // Mock error response
    const result = await service.createSubscriptionPlan({} as any);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## Deployment Patterns

### 1. Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          dfinity: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
```

### 2. Environment Configuration
```typescript
// src/config/environment.ts
export const environment = {
  production: import.meta.env.PROD,
  development: import.meta.env.DEV,
  icHost: import.meta.env.VITE_IC_HOST || 'https://ic0.app',
  factoryCanisterId: import.meta.env.VITE_FACTORY_CANISTER_ID,
};

export const getCanisterIds = () => ({
  factory: environment.factoryCanisterId,
  userPayment: 'dynamic', // Retrieved from factory
});
```

### 3. Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Best Practices

### 1. Code Splitting
```typescript
// Lazy load components
const SubscriptionDashboard = React.lazy(() => 
  import('./components/subscription/SubscriptionDashboard')
);

const ModalBuilder = React.lazy(() => 
  import('./components/modal/ModalBuilder')
);

// Use in routes
<Route
  path="/subscriptions"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionDashboard />
    </Suspense>
  }
/>
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// Memoize callback functions
const MemoizedCallback = ({ onSubmit }) => {
  const handleSubmit = useCallback((data) => {
    onSubmit(data);
  }, [onSubmit]);

  return <form onSubmit={handleSubmit} />;
};
```

### 3. Virtual Scrolling for Large Lists
```typescript
// Use react-window for large datasets
import { FixedSizeList as List } from 'react-window';

const VirtualizedSubscriptionList = ({ subscriptions }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <SubscriptionCard subscription={subscriptions[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={subscriptions.length}
      itemSize={120}
      itemData={subscriptions}
    >
      {Row}
    </List>
  );
};
```

## Accessibility Guidelines

### 1. Semantic HTML
```typescript
// Use proper semantic elements
<main role="main">
  <section aria-labelledby="subscription-plans">
    <h2 id="subscription-plans">Subscription Plans</h2>
    <div role="grid" aria-label="Available subscription plans">
      {plans.map(plan => (
        <article key={plan.id} role="gridcell">
          <SubscriptionPlanCard plan={plan} />
        </article>
      ))}
    </div>
  </section>
</main>
```

### 2. Keyboard Navigation
```typescript
// Ensure keyboard accessibility
const AccessibleButton = ({ children, onClick }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Action button"
      tabIndex={0}
    >
      {children}
    </button>
  );
};
```

### 3. Screen Reader Support
```typescript
// Provide proper ARIA labels and descriptions
<div
  role="status"
  aria-live="polite"
  aria-label={loading ? "Loading subscription data" : "Subscription data loaded"}
>
  {loading ? (
    <div aria-hidden="true">Loading...</div>
  ) : (
    <div>
      <span className="sr-only">
        {subscriptions.length} subscriptions loaded
      </span>
      <SubscriptionList subscriptions={subscriptions} />
    </div>
  )}
</div>
```

This guide provides comprehensive patterns for developing the modal builder and subscription management features in the ckPayment frontend. Follow these patterns for consistent, maintainable, and accessible code.
