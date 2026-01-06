import { render } from '@testing-library/react';
import OffersTable from '@/pages/Trade/Offers/OffersTable';

describe('OffersTable', () => {
  it('renders without crashing', () => {
    render(<OffersTable />);
    expect(true).toBeTruthy();
  });
});
