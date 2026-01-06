import { renderHook } from '@testing-library/react';
import useDeal from '@/hooks/useDeal';

describe('useDeal', () => {
  it('initializes without crashing', () => {
    const { result } = renderHook(() => useDeal('0x0'));
    expect(result).toBeDefined();
  });
});
