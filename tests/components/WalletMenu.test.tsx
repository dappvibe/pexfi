import { render } from '@testing-library/react';
import WalletMenu from '@/components/WalletMenu';

describe('WalletMenu', () => {
  it('renders without crashing', () => {
    render(<WalletMenu />);
    expect(true).toBeTruthy();
  });
});
