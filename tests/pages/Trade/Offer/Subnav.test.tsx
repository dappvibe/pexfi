import { render } from '@testing-library/react';
import Subnav from '@/pages/Trade/Offer/Subnav';

describe('Subnav', () => {
  it('renders without crashing', () => {
    render(<Subnav />);
    expect(true).toBeTruthy();
  });
});
