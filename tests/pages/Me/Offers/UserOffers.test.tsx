import { render } from '@testing-library/react';
import UserOffers from '@/pages/Me/Offers/UserOffers';
import { MemoryRouter } from 'react-router-dom';

describe('UserOffers', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <UserOffers />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
