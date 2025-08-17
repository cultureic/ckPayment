// useModal Hook Integration Tests - Real Canister Testing
// Following FRONTEND_TESTING_GUIDE.md patterns

import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModal } from '../useModal';

const TEST_CANISTER_ID = '6tzcr-tqaaa-aaaag-aufoa-cai'; // Our test canister

describe('useModal Hook Integration Tests', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: TEST_CANISTER_ID, autoFetch: false })
    );
    
    expect(result.current.modals).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.analytics).toBeInstanceOf(Map);
  });

  it('should successfully fetch modals from real canister', async () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: TEST_CANISTER_ID, autoFetch: false })
    );

    // Manually trigger fetch to control timing
    await waitFor(async () => {
      await result.current.fetchModals();
    });

    // The request should complete successfully even if there are no modals
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(Array.isArray(result.current.modals)).toBe(true);
    
    console.log(`Hook found ${result.current.modals.length} modals`);
  }, { timeout: 10000 });

  it('should handle invalid canister ID gracefully', async () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: 'invalid-canister-id', autoFetch: false })
    );

    await waitFor(async () => {
      await result.current.fetchModals();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(typeof result.current.error).toBe('string');
    expect(result.current.modals).toEqual([]);
  }, { timeout: 10000 });

  it('should provide helper functions', () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: TEST_CANISTER_ID, autoFetch: false })
    );

    // Check that all expected functions are available
    expect(typeof result.current.fetchModals).toBe('function');
    expect(typeof result.current.createModal).toBe('function');
    expect(typeof result.current.updateModal).toBe('function');
    expect(typeof result.current.deleteModal).toBe('function');
    expect(typeof result.current.toggleModalStatus).toBe('function');
    expect(typeof result.current.fetchAnalytics).toBe('function');
    expect(typeof result.current.trackModalView).toBe('function');
    expect(typeof result.current.generateEmbedCode).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.getModal).toBe('function');
    expect(typeof result.current.getModalAnalytics).toBe('function');
  });

  it('should clear error when clearError is called', async () => {
    const { result } = renderHook(() => 
      useModal({ canisterId: 'invalid-canister-id', autoFetch: false })
    );

    // First, create an error
    await waitFor(async () => {
      await result.current.fetchModals();
    });

    expect(result.current.error).toBeDefined();

    // Then clear it
    result.current.clearError();
    
    expect(result.current.error).toBe(null);
  }, { timeout: 10000 });
});
