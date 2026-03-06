import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the global fetch
window.fetch = vi.fn();

describe('App component', () => {
  beforeEach(() => {
    window.fetch.mockClear();
  });

  it('renders Cosmic Guestbook header', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "Commander Shepard", message: "I should go.", timestamp: "2024-01-01" }]
    });

    render(<App />);

    const headerElement = screen.getByText(/Cosmic/i);
    expect(headerElement).toBeInTheDocument();
    
    // Wait for the fetched data to render
    await waitFor(() => {
      expect(screen.getByText('Commander Shepard')).toBeInTheDocument();
    });
  });

  it('renders empty state when no entries', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Awaiting first transmission/i)).toBeInTheDocument();
    });
  });
});
