import { render } from '@testing-library/react';
import DealProgress from '@/pages/Trade/Deal/DealProgress';

describe('DealProgress', () => {
  it('renders without crashing', () => {
    render(<DealProgress />);
    expect(true).toBeTruthy();
  });
});
