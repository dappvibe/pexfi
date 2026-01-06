import { render } from '@testing-library/react';
import Layout from '@/layout/index';
import { MemoryRouter } from 'react-router-dom';

describe('Layout', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Layout>
           <div>Child</div>
        </Layout>
      </MemoryRouter>
    );
    expect(true).toBeTruthy();
  });
});
