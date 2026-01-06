import { render } from '@testing-library/react';
import ExplorerLink from '@/components/ExplorerLink';

describe('ExplorerLink', () => {
  it('renders without crashing', () => {
    // Requires props likely, but for boilerplate we just render
    // ExplorerLink might need mocked props to not crash, but "EMPTY tests" request implies minimal setup.
    // However, React validation might complain. We'll pass empty/dummy props if it's obvious, but user asked for EMPTY tests.
    render(<ExplorerLink type="address" value="0x0" />);
    expect(true).toBeTruthy();
  });
});
