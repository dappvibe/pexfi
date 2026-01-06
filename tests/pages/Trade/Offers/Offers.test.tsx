import { render } from '@testing-library/react';
import Offers from '@/pages/Trade/Offers/Offers';
import { MemoryRouter } from 'react-router-dom';

describe('Offers', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Offers />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
