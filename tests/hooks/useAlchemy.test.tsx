import { renderHook } from '@testing-library/react';
import useAlchemy from '@/hooks/useAlchemy';

describe('useAlchemy', () => {
  it('initializes without crashing', () => {
    // Might fail if not mocked or params missing, but adhering to "EMPTY tests" request
    const { result } = renderHook(() => useAlchemy());
    expect(result).toBeDefined();
  });
});
