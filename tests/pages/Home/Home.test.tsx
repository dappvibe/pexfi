import { render } from '@testing-library/react';
import Home from '@/pages/Home/Home';
import { MemoryRouter } from 'react-router-dom';

describe('Home', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
