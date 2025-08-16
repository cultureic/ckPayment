# ckPayment Feature Development Guide

## Overview

The ckPayment system consists of three interconnected layers that must remain synchronized when developing new features:

1. **SDK/Pay** - JavaScript SDK for external integrations
2. **user_payment_canister** - Rust backend canister 
3. **ckPayment-web3 Dashboard** - React admin interface

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   External      │────▶│    SDK/Pay           │────▶│   User Payment      │
│   Applications  │     │   (Frontend SDK)     │     │   Canister          │
│                 │     │                      │     │   (Rust Backend)    │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘
                                 │                             ▲
                                 ▼                             │
                        ┌──────────────────────┐               │
                        │   ckPayment-web3     │───────────────┘
                        │   Dashboard          │
                        │   (React Admin UI)   │
                        └──────────────────────┘
```

## Component Relationships

### 1. SDK/Pay (`src/SDK/`)
**Purpose**: External-facing SDK for payment integration

**Key Files**:
- `Pay.jsx` - Main payment component with UI
- `userPaymentCanister.js` - Service layer for canister communication
- `auth.jsx` - Internet Identity authentication
- `interfaceHook.js` - Interface methods for payment processing
- `Components/TokenIcon.jsx` - Token display component
- `Hooks/walletProvider.jsx` - Wallet state management
- `Hooks/userPaymentCanisterProvider.jsx` - Canister context
- `Components/PaymentForm/PaymentForm.js` - Reusable payment form component
- `Components/PaymentModal/PaymentModal.js` - Modal payment UI component
- `Components/TokenSelector/TokenSelector.js` - Token selection UI component
- `providers/PaymentProvider.js` - Direct canister payment provider

**Component Hierarchy**:
```
SDK Root
├── AuthProvider (auth.jsx)
│   └── UserPaymentCanisterProvider (userPaymentCanisterProvider.jsx)
│       └── WalletProvider (walletProvider.jsx)
│           └── PaymentComponent (Pay.jsx)
│               ├── PaymentStep
│               └── SuccessStep
└── PaymentProvider (providers/PaymentProvider.js)
    ├── PaymentForm
    │   └── TokenSelector
    └── PaymentModal
```

**SDK Context Providers**:
1. **AuthProvider**: Manages Internet Identity authentication state
   - Methods: `login()`, `logout()`, `isAuthenticated`, `identity`, `principal`
   - Used by: All authenticated components

2. **UserPaymentCanisterProvider**: Manages user payment canister service
   - Methods: `getSupportedTokensFromCanister()`, `transferToken()`, `canisterId`
   - State: `supportedTokens`, `userPaymentService`
   - Used by: PaymentStep, TokenIcon components

3. **WalletProvider**: Manages token balances and transfers
   - Methods: `getBalances()`, `transferToken()`, `transferTokenAccount()`
   - State: `balances`, `supportedTokens`
   - Used by: PaymentStep component

4. **PaymentProvider**: Alternative direct canister provider
   - Methods: `createInvoice()`, `getInvoice()`, `getTokenConfig()`
   - State: `supportedTokens`, `canisterInfo`, `loading`, `error`
   - Used by: PaymentForm, TokenSelector components

**Responsibilities**:
- Provide payment UI components for external apps
- Handle authentication with Internet Identity
- Communicate with user payment canisters
- Token balance management and display
- Payment processing workflow

### 2. User Payment Canister (`src/user_payment_canister/`)
**Purpose**: Backend business logic and data storage

**Key Files**:
- `src/lib.rs` - Main canister implementation
- `user_payment_canister.did` - Candid interface definition

**Data Structures**:
- `TokenConfig` - Token configuration and metadata
- `UserCanisterConfig` - User-specific canister settings
- `PaymentInvoice` - Payment request records
- `PaymentTransaction` - Transaction history
- `PaymentAnalytics` - Analytics and metrics

**Core Methods**:
- Token Management: `add_supported_token`, `remove_supported_token`, `update_supported_token`, `toggle_token_status`
- Payment Processing: `create_invoice`, `process_payment`
- Data Retrieval: `get_supported_tokens`, `get_transaction_history`, `get_analytics`
- Configuration: `update_configuration`, `admin_update_owner`

### 3. ckPayment-web3 Dashboard (`ckPayment-web3/src/`)
**Purpose**: Admin interface for managing payment infrastructure

**Key Files**:
- `components/factory/FactoryTab.tsx` - Factory management UI
- `components/factory/TokenManager.tsx` - Token CRUD interface
- `components/dashboard/UserPaymentDashboard.tsx` - Analytics dashboard
- `services/user-payment-service.ts` - Service layer for canister communication
- `hooks/useFactory.ts` - Factory state management

**Responsibilities**:
- Deploy and manage user payment canisters
- Token management (CRUD operations)
- Analytics and reporting
- Configuration management
- Real-time data synchronization

## Data Flow Patterns

### 1. Token Management Flow
```
Dashboard TokenManager → user-payment-service.ts → User Payment Canister
                ↓                                            ↓
SDK userPaymentCanister.js ← Candid Interface ← lib.rs Methods
                ↓
SDK Pay.jsx Component (Live Token Display)
```

### 2. Payment Processing Flow
```
External App → SDK Pay.jsx → interfaceHook.js → User Payment Canister
                                    ↓                    ↓
Dashboard Analytics ← user-payment-service.ts ← Transaction Storage
```

### 3. Configuration Flow
```
Dashboard Factory → useFactory.ts → Factory Canister
                           ↓              ↓
Dashboard TokenManager → user-payment-service.ts → User Payment Canister
                           ↓                               ↓
SDK userPaymentCanisterProvider ← Configuration Updates ← Config Storage
```

## Feature Development Workflow

### Phase 1: Backend Implementation (user_payment_canister)

1. **Define Data Structures**
   ```rust
   // Add new types in lib.rs
   #[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
   pub struct NewFeatureConfig {
       // Define fields
   }
   ```

2. **Implement Storage**
   ```rust
   // Add stable storage in thread_local! block
   static NEW_FEATURE_DATA: RefCell<StableBTreeMap<String, NewFeatureConfig, Memory>> = RefCell::new(
       StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(X))))
   );
   ```

3. **Add Canister Methods**
   ```rust
   #[ic_cdk::update]
   async fn new_feature_method(param: Type) -> Result<ReturnType, String> {
       // Implementation
   }
   ```

4. **Update Candid Interface**
   ```
   // Add to user_payment_canister.did
   new_feature_method : (Type) -> (Result);
   ```

5. **Build and Test**
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

### Phase 2: Dashboard Integration (ckPayment-web3)

1. **Update Service Layer**
   ```typescript
   // Add to services/user-payment-service.ts
   async newFeatureMethod(canisterId: string, param: Type): Promise<ReturnType> {
     const actor = await this.getActor(canisterId);
     return await actor.new_feature_method(param);
   }
   ```

2. **Update TypeScript Types**
   ```typescript
   // Add interfaces matching Rust types
   export interface NewFeatureConfig {
     // Define fields matching Rust struct
   }
   ```

3. **Create/Update UI Components**
   ```typescript
   // Create components/feature/NewFeatureManager.tsx
   export function NewFeatureManager({ canister }: { canister: any }) {
     // Component implementation
   }
   ```

4. **Integrate with Factory/Dashboard**
   ```typescript
   // Update FactoryTab.tsx or Dashboard components
   import { NewFeatureManager } from './NewFeatureManager';
   ```

### Phase 3: SDK Integration (src/SDK/)

1. **Update SDK Service Layer**
   ```javascript
   // Update userPaymentCanister.js
   async newFeatureMethod(param) {
     if (!this.actor) await this.initializeActor();
     return await this.actor.new_feature_method(param);
   }
   ```

2. **Update Interface Hooks**
   ```javascript
   // Update interfaceHook.js
   export const newFeatureAction = async (param) => {
     const authClient = await createAuthClient();
     return await newFeatureWrapped(authClient, param);
   };
   
   export const newFeatureWrapped = async (authClient, param) => {
     try {
       const isAuth = await isAuthenticated(authClient);
       const backendActor = await getBackendActor(authClient);
       if (!isAuth) return null;
       
       const result = await backendActor.newFeatureMethod(param);
       if ('ok' in result) {
         return result.ok;
       } else if ('err' in result) {
         console.error('Error:', result.err);
       }
     } catch (error) {
       console.error('Failed:', error);
     }
   };
   ```

3. **Update React Providers**
   ```jsx
   // Update Hooks/userPaymentCanisterProvider.jsx
   const useUserPaymentCanister = () => {
     // Existing state and hooks...
     
     const newFeatureMethod = async (param) => {
       try {
         if (!userPaymentService) {
           throw new Error('User payment service not initialized');
         }
         
         const result = await userPaymentService.newFeatureMethod(param);
         return result;
       } catch (error) {
         console.error('Feature failed:', error);
         throw error;
       }
     };
     
     return {
       // Existing values...
       newFeatureMethod,
     };
   };
   ```

4. **Update WalletProvider**
   ```jsx
   // Update Hooks/walletProvider.jsx if feature is token-related
   const useTokenClient = () => {
     // Existing code...
     
     // Add new token-related functionality
     async function handleNewTokenFeature(param) {
       // Implementation
     }
     
     return {
       // Existing values...
       handleNewTokenFeature,
     };
   };
   ```

5. **Add to Payment Components**
   ```jsx
   // Update Pay.jsx or existing components
   const PaymentStep = ({ /* props */ }) => {
     const { newFeatureMethod } = useUserPaymentCanisterContext();
     // Implement UI for new feature
     
     const handleNewFeature = async () => {
       try {
         const result = await newFeatureMethod(params);
         // Handle success
       } catch (error) {
         // Handle error
       }
     };
     
     return (
       <div>
         {/* Feature UI */}
         <button onClick={handleNewFeature}>Use New Feature</button>
       </div>
     );
   };
   ```

6. **Create New UI Components**
   ```jsx
   // Create Components/NewFeature/NewFeatureComponent.jsx
   import React from 'react';
   import { useUserPaymentCanisterContext } from '../../Hooks/userPaymentCanisterProvider';
   
   const NewFeatureComponent = ({ param }) => {
     const { newFeatureMethod } = useUserPaymentCanisterContext();
     // Implementation
     
     return (
       <div className="ckpay-new-feature">
         {/* Component UI */}
       </div>
     );
   };
   
   export default NewFeatureComponent;
   ```

7. **Add Alternative PaymentProvider Support**
   ```jsx
   // Update providers/PaymentProvider.js for direct canister integration
   export const PaymentProvider = ({ children, canisterId, host }) => {
     // Existing code...
     
     // Add new feature method
     const newFeatureMethod = async (param) => {
       if (!actor) throw new Error('Payment canister not initialized');
       
       try {
         setLoading(true);
         const result = await actor.new_feature_method(param);
         // Process result
         return result;
       } catch (error) {
         console.error('Feature failed:', error);
         throw error;
       } finally {
         setLoading(false);
       }
     };
     
     const value = {
       // Existing values...
       newFeatureMethod,
     };
     
     return (
       <PaymentContext.Provider value={value}>
         {children}
       </PaymentContext.Provider>
     );
   };
   ```

## Development Checklist

When implementing a new feature, ensure all these items are completed:

### Backend (user_payment_canister)
- [ ] Data structures defined with proper Storable implementation
- [ ] Stable storage allocated with unique MemoryId
- [ ] Canister methods implemented with proper error handling
- [ ] Authorization guards added where needed
- [ ] Candid interface updated
- [ ] Unit tests written (if applicable)
- [ ] Build successful

### Dashboard (ckPayment-web3)
- [ ] TypeScript interfaces match Rust structures exactly
- [ ] Service layer methods implemented
- [ ] UI components created with proper error handling
- [ ] Loading states and user feedback implemented
- [ ] Integration with existing dashboard flows
- [ ] Real-time data refresh implemented
- [ ] Responsive design considerations

### SDK (src/SDK/)
- [ ] Service methods implemented in userPaymentCanister.js
- [ ] Interface hooks updated in interfaceHook.js
- [ ] React components updated or created
- [ ] Context providers updated:
  - [ ] UserPaymentCanisterProvider (userPaymentCanisterProvider.jsx)
  - [ ] WalletProvider if token-related (walletProvider.jsx)
  - [ ] PaymentProvider for direct canister usage (providers/PaymentProvider.js)
- [ ] UI components created or updated:
  - [ ] PaymentStep in Pay.jsx (if modifying main payment flow)
  - [ ] Standalone components in Components/ directory
  - [ ] PaymentForm/PaymentModal (if implementing alternative payment flows)
- [ ] Authentication flow considered
- [ ] Error handling implemented in all layers
- [ ] CSS styles added for new UI components
- [ ] External integration documentation updated

### Integration Testing
- [ ] End-to-end flow tested: Dashboard → Canister → SDK
- [ ] Data consistency verified across all components
- [ ] Error scenarios tested
- [ ] Authentication edge cases handled
- [ ] Performance implications assessed

## Common Patterns

### 1. Error Handling Pattern
```rust
// Rust canister
pub fn operation() -> Result<Success, String> {
    // Validate input
    // Check authorization
    // Perform operation
    // Handle errors consistently
}
```

```typescript
// Dashboard service
async operation(): Promise<{ success: boolean; error?: string; data?: T }> {
  try {
    const result = await actor.operation();
    if ('Ok' in result) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. State Management Pattern
```jsx
// React hook pattern
const useFeatureState = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.getData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};
```

### 3. Data Validation Pattern
```rust
// Rust validation
fn validate_token_config(config: &TokenConfig) -> Result<(), String> {
    if config.symbol.is_empty() {
        return Err("Token symbol cannot be empty".to_string());
    }
    // Additional validation
    Ok(())
}
```

```typescript
// TypeScript validation
const validateTokenConfig = (config: TokenConfig): string | null => {
  if (!config.symbol?.trim()) {
    return "Token symbol cannot be empty";
  }
  // Additional validation
  return null;
};
```

## Debugging Tips

### 1. Component Communication Issues
- Check Candid interface matches between frontend and backend
- Verify Principal/canister ID formats are correct
- Ensure authentication state is properly propagated
- Check network configuration (local vs mainnet)

### 2. State Synchronization Issues
- Verify refresh patterns after data mutations
- Check cache invalidation in services
- Ensure React dependencies arrays are correct
- Verify stable storage is properly configured

### 3. Build Issues
- Ensure all TypeScript interfaces match Rust structs
- Check import paths are correct after file moves
- Verify all dependencies are properly declared
- Check for circular import dependencies

## Performance Considerations

### 1. Canister Storage
- Use appropriate storage types (Cell vs BTreeMap)
- Consider memory allocation for large datasets
- Implement pagination for large data retrieval
- Monitor canister memory usage

### 2. Frontend Performance
- Implement proper loading states
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Cache actor instances appropriately

### 3. Network Optimization
- Batch multiple operations where possible
- Implement optimistic updates for better UX
- Use query methods instead of update methods when possible
- Consider caching strategies for frequently accessed data

## Security Considerations

### 1. Authorization
- Always validate caller identity in canister methods
- Implement proper owner/admin checks
- Validate all input parameters
- Use secure random generation for IDs

### 2. Data Validation
- Sanitize all user inputs
- Validate data types and ranges
- Implement rate limiting where appropriate
- Check for potential overflow/underflow

### 3. Frontend Security
- Validate data received from canisters
- Implement proper error messages without sensitive info
- Use secure storage for sensitive data
- Validate user permissions in UI

This guide should be referenced for every new feature development to ensure consistency and avoid getting lost in the complexity of the multi-layer architecture.
