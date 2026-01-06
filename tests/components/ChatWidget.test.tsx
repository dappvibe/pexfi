import { render } from '@testing-library/react';
import ChatWidget from '@/components/ChatWidget';

describe('ChatWidget', () => {
  it('renders without crashing', () => {
    render(<ChatWidget />);
    expect(true).toBeTruthy();
  });
});
