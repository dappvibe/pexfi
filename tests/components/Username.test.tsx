import { render } from '@testing-library/react';
import Username from '@/components/Username';

describe('Username', () => {
  it('renders without crashing', () => {
    render(<Username address="0x123" />);
    expect(true).toBeTruthy();
  });
});
