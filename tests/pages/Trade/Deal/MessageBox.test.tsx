import { render } from '@testing-library/react';
import MessageBox from '@/pages/Trade/Deal/MessageBox';

describe('MessageBox', () => {
  it('renders without crashing', () => {
    render(<MessageBox />);
    expect(true).toBeTruthy();
  });
});
