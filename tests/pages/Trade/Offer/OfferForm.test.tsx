import { render } from '@testing-library/react';
import OfferForm from '@/pages/Trade/Offer/OfferForm';

describe('OfferForm', () => {
  it('renders without crashing', () => {
    render(<OfferForm />);
    expect(true).toBeTruthy();
  });
});
