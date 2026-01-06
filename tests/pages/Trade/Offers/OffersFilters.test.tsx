import { render } from '@testing-library/react';
import OffersFilters from '@/pages/Trade/Offers/OffersFilters';

describe('OffersFilters', () => {
  it('renders without crashing', () => {
    render(<OffersFilters />);
    expect(true).toBeTruthy();
  });
});
