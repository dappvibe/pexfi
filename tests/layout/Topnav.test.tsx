import { render } from '@testing-library/react';
import Topnav from '@/layout/Topnav';
import { MemoryRouter } from 'react-router-dom';

describe('Topnav', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Topnav />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
