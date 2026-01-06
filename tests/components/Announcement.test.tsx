import { render } from '@testing-library/react';
import Announcement from '@/components/Announcement';

describe('Announcement', () => {
  it('renders without crashing', () => {
    render(<Announcement />);
    expect(true).toBeTruthy();
  });
});
