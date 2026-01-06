import { render } from '@testing-library/react';
import Profile from '@/pages/Me/Profile';

describe('Profile', () => {
  it('renders without crashing', () => {
    // Might need params or context
    render(<Profile />);
    expect(true).toBeTruthy();
  });
});
