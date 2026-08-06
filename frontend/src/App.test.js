import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page hero title', () => {
  render(<App />);
  const heading = screen.getByText(/Réussissez votre immigration au Canada/i);
  expect(heading).toBeInTheDocument();
});
