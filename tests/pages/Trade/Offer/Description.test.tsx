import { render } from '@testing-library/react';
import Description from '@/pages/Trade/Offer/Description';

describe('Description', () => {
  it('renders without crashing', () => {
    render(<Description />);
    expect(true).toBeTruthy();
  });
});
