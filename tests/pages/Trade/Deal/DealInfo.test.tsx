import { render } from '@testing-library/react';
import DealInfo from '@/pages/Trade/Deal/DealInfo';

describe('DealInfo', () => {
  it('renders without crashing', () => {
    render(<DealInfo />);
    expect(true).toBeTruthy();
  });
});
