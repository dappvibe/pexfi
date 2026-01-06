import { renderHook } from '@testing-library/react';
import { useInventory } from '@/hooks/useInventory';

describe('useInventory', () => {
  it('initializes without crashing', () => {
    const { result } = renderHook(() => useInventory());
    expect(result).toBeDefined();
  });
});
