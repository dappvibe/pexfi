import { render } from '@testing-library/react';
import UserDeals from '@/pages/Me/UserDeals';
import { MemoryRouter } from 'react-router-dom';

describe('UserDeals', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <UserDeals />
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
