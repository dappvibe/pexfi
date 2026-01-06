import { render } from '@testing-library/react';
import OfferNew from '@/pages/Trade/Offer/OfferNew';
import { MemoryRouter } from 'react-router-dom';

describe('OfferNew', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <OfferNew />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
