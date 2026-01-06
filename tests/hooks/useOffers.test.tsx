import { renderHook } from '@testing-library/react';
import { useOffers } from '@/hooks/useOffers';

describe('useOffers', () => {
  it('initializes without crashing', () => {
    const { result } = renderHook(() => useOffers());
    expect(result).toBeDefined();
  });
});
