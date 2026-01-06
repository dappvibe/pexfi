import { render } from '@testing-library/react';
import Notifications from '@/components/Notifications';

describe('Notifications', () => {
  it('renders without crashing', () => {
    render(<Notifications />);
    expect(true).toBeTruthy();
  });
});
