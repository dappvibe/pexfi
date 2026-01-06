import { render } from '@testing-library/react';
import Offer from '@/pages/Trade/Offer/Offer';
import { MemoryRouter } from 'react-router-dom';

describe('Offer', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
         <Offer />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
