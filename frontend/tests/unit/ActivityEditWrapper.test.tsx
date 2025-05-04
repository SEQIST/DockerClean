// tests/unit/ActivityEditWrapper.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ActivityEditWrapper from '../../src/features/activities/components/ActivityEditWrapper';

const mockOnSave = jest.fn();

describe('ActivityEditWrapper', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { _id: '1', name: 'Test Activity', process: 'Process 1', executedBy: 'Role 1' },
      ]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches activities on mount', async () => {
    render(<ActivityEditWrapper onSave={mockOnSave} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/activities');
    });
  });

  it('renders ActivityFormMain', async () => {
    render(<ActivityEditWrapper onSave={mockOnSave} />);
    await waitFor(() => {
      expect(screen.getByText('Aktivität bearbeiten')).toBeInTheDocument();
    });
  });
});