import { render } from '@testing-library/react';
import NetworkSelector from '@/components/NetworkSelector';

describe('NetworkSelector', () => {
  it('renders without crashing', () => {
    render(<NetworkSelector />);
    expect(true).toBeTruthy();
  });
});
