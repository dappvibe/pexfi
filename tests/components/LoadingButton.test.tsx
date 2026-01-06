import { render } from '@testing-library/react';
import LoadingButton from '@/components/LoadingButton';

describe('LoadingButton', () => {
  it('renders without crashing', () => {
    render(<LoadingButton />);
    expect(true).toBeTruthy();
  });
});
