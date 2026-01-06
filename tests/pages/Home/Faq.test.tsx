import { render } from '@testing-library/react';
import Faq from '@/pages/Home/Faq';

describe('Faq', () => {
  it('renders without crashing', () => {
    render(<Faq />);
    expect(true).toBeTruthy();
  });
});
