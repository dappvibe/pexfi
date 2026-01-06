import { render } from '@testing-library/react';
import Feedback from '@/pages/Trade/Deal/Feedback';

describe('Feedback', () => {
  it('renders without crashing', () => {
    render(<Feedback />);
    expect(true).toBeTruthy();
  });
});
