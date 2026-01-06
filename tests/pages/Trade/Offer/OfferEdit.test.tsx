import { render } from '@testing-library/react';
import OfferEdit from '@/pages/Trade/Offer/OfferEdit';
import { MemoryRouter } from 'react-router-dom';

describe('OfferEdit', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <OfferEdit />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
