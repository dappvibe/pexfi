import { render } from '@testing-library/react';
import TokenNav from '@/pages/Trade/Offers/TokenNav';

describe('TokenNav', () => {
  it('renders without crashing', () => {
    render(<TokenNav />);
    expect(true).toBeTruthy();
  });
});
