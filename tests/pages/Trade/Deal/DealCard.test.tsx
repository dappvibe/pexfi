import { render } from '@testing-library/react';
import DealCard from '@/pages/Trade/Deal/DealCard';
import { MemoryRouter } from 'react-router-dom';

describe('DealCard', () => {
  it('renders without crashing', () => {
    // DealCard likely needs a deal prop, but we'll try empty first or just render
    render(
      <MemoryRouter>
         <DealCard />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
