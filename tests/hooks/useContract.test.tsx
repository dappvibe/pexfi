import { renderHook } from '@testing-library/react';
import { useContract } from '@/hooks/useContract';

describe('useContract', () => {
  it('initializes without crashing', () => {
    const { result } = renderHook(() => useContract('Market#Market'));
    expect(result).toBeDefined();
  });
});
