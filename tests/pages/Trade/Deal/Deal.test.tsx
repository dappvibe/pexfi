import { render } from '@testing-library/react';
import Deal from '@/pages/Trade/Deal/Deal';
import { MemoryRouter } from 'react-router-dom';

describe('Deal', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Deal />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
