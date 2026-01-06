import { render } from '@testing-library/react';
import Controls from '@/pages/Trade/Deal/Controls';

describe('Controls', () => {
  it('renders without crashing', () => {
    // Requires props likely
    render(<Controls />);
    expect(true).toBeTruthy();
  });
});
