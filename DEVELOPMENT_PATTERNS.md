# ckPayment Development Patterns

## Data Type Mapping Reference

### Rust ↔ TypeScript
```rust
// Rust
String                    → string
u64                      → bigint  
u32                      → number
bool                     → boolean
Option<T>                → T | null
Vec<T>                   → T[]
Principal                → Principal
Result<T, String>        → { Ok?: T; Err?: string }
```

### Candid ↔ TypeScript
```candid
text                     → string
nat64                    → bigint
nat32                    → number
bool                     → boolean
opt T                    → [] | [T]
vec T                    → T[]
principal                → Principal
variant { Ok: T; Err: text } → { Ok?: T; Err?: string }
```

## Common Patterns Cheat Sheet

### Authorization Check
```rust
#[ic_cdk::update]
async fn protected_method() -> Result<(), String> {
    let caller = ic_cdk::caller();
    OWNER.with(|owner| {
        if owner.borrow().get() != caller {
            return Err("Unauthorized".to_string());
        }
        Ok(())
    })
}
```

### Stable Storage Pattern
```rust
thread_local! {
    // Memory manager for stable storage
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Stable storage for data
    static DATA_STORAGE: RefCell<StableBTreeMap<String, MyDataType, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
}
```

### Service Method Pattern
```typescript
async operation(canisterId: string, param: Type): Promise<{ success: boolean; error?: string; data?: T }> {
  try {
    const actor = await this.getActor(canisterId);
    const result = await actor.operation(param);
    
    if ('Ok' in result) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### React Hook Pattern
```jsx
const useFeature = (canisterId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getData(canisterId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canisterId]);

  return { data, loading, error, fetchData };
};
```

## Feature Development Workflow

### 1. Backend First (user_payment_canister)
- [ ] Add data structure in `lib.rs`
- [ ] Add stable storage with new MemoryId
- [ ] Implement canister method with authorization
- [ ] Update `user_payment_canister.did`
- [ ] Build: `cargo build --target wasm32-unknown-unknown --release`

### 2. Dashboard Integration (ckPayment-web3)
- [ ] Add TypeScript interface in `user-payment-service.ts`
- [ ] Add service method
- [ ] Create/update UI component
- [ ] Integrate with FactoryTab or Dashboard

### 3. SDK Integration (src/SDK/)
- [ ] Add method to `userPaymentCanister.js`
- [ ] Update `interfaceHook.js` with wrapped function pattern
- [ ] Update React providers:
  - [ ] `userPaymentCanisterProvider.jsx` - Main canister provider
  - [ ] `walletProvider.jsx` - Token balance provider  
  - [ ] `providers/PaymentProvider.js` - Direct canister provider
- [ ] Update/create UI components:
  - [ ] `Pay.jsx` - Main payment component
  - [ ] `Components/` - Standalone components
  - [ ] `PaymentForm.js` - Form component
  - [ ] `TokenSelector.js` - Token selection

## Architecture Patterns

### CRUD Method Implementation
```rust
// CREATE
#[ic_cdk::update]
fn create_item(item: MyItem) -> Result<String, String> {
    let caller = ic_cdk::caller();
    if !is_authorized(caller) {
        return Err("Unauthorized".to_string());
    }
    
    let id = generate_id();
    ITEMS.with(|items| {
        items.borrow_mut().insert(id.clone(), item);
    });
    
    Ok(id)
}

// READ
#[ic_cdk::query]
fn get_item(id: String) -> Result<MyItem, String> {
    ITEMS.with(|items| {
        items.borrow().get(&id)
            .ok_or("Item not found".to_string())
    })
}

// UPDATE
#[ic_cdk::update]
fn update_item(id: String, item: MyItem) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if !is_authorized(caller) {
        return Err("Unauthorized".to_string());
    }
    
    ITEMS.with(|items| {
        let mut map = items.borrow_mut();
        if map.contains_key(&id) {
            map.insert(id, item);
            Ok(())
        } else {
            Err("Item not found".to_string())
        }
    })
}

// DELETE
#[ic_cdk::update]
fn delete_item(id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if !is_authorized(caller) {
        return Err("Unauthorized".to_string());
    }
    
    ITEMS.with(|items| {
        items.borrow_mut().remove(&id)
            .map(|_| ())
            .ok_or("Item not found".to_string())
    })
}
```

### Frontend Service Integration
```typescript
class MyFeatureService {
  private actor: any;
  
  async initialize() {
    this.actor = await createActor(canisterId, {
      agentOptions: { host: 'https://ic0.app' }
    });
  }
  
  async createItem(item: MyItem): Promise<ServiceResponse<string>> {
    try {
      const result = await this.actor.create_item(item);
      if ('Ok' in result) {
        return { success: true, data: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
```

## Error Handling Patterns

### Backend Error Handling
```rust
type Result<T> = std::result::Result<T, String>;

fn validate_input(input: &str) -> Result<()> {
    if input.is_empty() {
        return Err("Input cannot be empty".to_string());
    }
    if input.len() > 100 {
        return Err("Input too long".to_string());
    }
    Ok(())
}

#[ic_cdk::update]
fn create_with_validation(input: String) -> Result<String> {
    validate_input(&input)?;
    
    // Process...
    Ok("created".to_string())
}
```

### Frontend Error Handling
```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const handleServiceCall = async <T>(
  serviceCall: () => Promise<ServiceResponse<T>>
): Promise<T | null> => {
  try {
    const response = await serviceCall();
    if (response.success) {
      return response.data || null;
    } else {
      console.error('Service error:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};
```

## State Management Patterns

### Rust State Management
```rust
#[derive(CandidType, Deserialize, Clone)]
pub struct AppState {
    pub initialized: bool,
    pub owner: Principal,
    pub settings: HashMap<String, String>,
}

thread_local! {
    static STATE: RefCell<Cell<AppState, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), AppState::default()).unwrap()
    );
}

fn update_state<F, R>(f: F) -> R 
where
    F: FnOnce(&mut AppState) -> R,
{
    STATE.with(|state| {
        let mut current = state.borrow().get().clone();
        let result = f(&mut current);
        state.borrow().set(current).unwrap();
        result
    })
}
```

### React State Management
```tsx
interface AppState {
  user: User | null;
  canisters: Canister[];
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<{
  state: AppState;
  actions: {
    setUser: (user: User | null) => void;
    setCanisters: (canisters: Canister[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    canisters: [],
    loading: false,
    error: null,
  });

  const actions = {
    setUser: (user: User | null) => setState(prev => ({ ...prev, user })),
    setCanisters: (canisters: Canister[]) => setState(prev => ({ ...prev, canisters })),
    setLoading: (loading: boolean) => setState(prev => ({ ...prev, loading })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};
```

## Performance Optimization Patterns

### Efficient Queries
```rust
// Use query methods for read operations
#[ic_cdk::query]
fn get_items_by_user(user: Principal) -> Vec<MyItem> {
    ITEMS.with(|items| {
        items.borrow()
            .iter()
            .filter(|(_, item)| item.owner == user)
            .map(|(_, item)| item)
            .collect()
    })
}

// Paginated queries for large datasets
#[ic_cdk::query]
fn get_items_paginated(offset: usize, limit: usize) -> Vec<MyItem> {
    ITEMS.with(|items| {
        items.borrow()
            .iter()
            .skip(offset)
            .take(limit)
            .map(|(_, item)| item)
            .collect()
    })
}
```

### Frontend Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// Debounced API calls
const useDebouncedCall = (callback: Function, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    setDebounceTimer(setTimeout(() => {
      callback(...args);
    }, delay));
  }, [callback, delay, debounceTimer]);

  return debouncedCallback;
};
```
