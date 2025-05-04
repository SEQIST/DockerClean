// tests/unit/activities/ActivitiesPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ActivitiesPage from '../../src/features/activities/pages/ActivitiesPage';

// Mock-Server für API-Aufrufe
const server = setupServer(
  http.get('http://localhost:5001/api/activities', () => {
    return HttpResponse.json([
      {
        _id: '1',
        name: 'Activity 1',
        abbreviation: 'A1',
        process: 'proc1',
        result: 'wp1',
        trigger: {
          workProducts: [
            { _id: 'wp3', completionPercentage: 100, isWorkloadDetermining: false } // completionPercentage hinzufügen
          ]
        }
      },
      {
        _id: '2',
        name: 'Activity 2',
        abbreviation: 'A2',
        process: 'proc2',
        result: 'wp2',
        trigger: {
          workProducts: []
        }
      },
    ]);
  }),
  http.get('http://localhost:5001/api/processes', () => {
    return HttpResponse.json([
      { _id: 'proc1', name: 'Process 1' },
      { _id: 'proc2', name: 'Process 2' },
    ]);
  }),
  http.get('http://localhost:5001/api/workproducts', () => {
    return HttpResponse.json([
      { _id: 'wp1', name: 'Work Product 1', description: '', abbreviation: '' }, // description hinzufügen
      { _id: 'wp2', name: 'Work Product 2', description: '', abbreviation: '' }, // description hinzufügen
    ]);
  }),
  http.delete('http://localhost:5001/api/activities/:id', () => {
    return HttpResponse.json({}, { status: 200 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ActivitiesPage', () => {
  it('renders the activities list', async () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
      expect(screen.getByText('Activity 2')).toBeInTheDocument();
    });
  });

  it('filters activities by search query', async () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Suche nach Name...'), { target: { value: 'Activity 1' } });

    expect(screen.getByText('Activity 1')).toBeInTheDocument();
    expect(screen.queryByText('Activity 2')).not.toBeInTheDocument();
  });

  it('sorts activities by name', async () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Name ↑'));

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Activity 2');
    expect(rows[2]).toHaveTextContent('Activity 1');
  });

  it('deletes an activity', async () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Activity 1')).not.toBeInTheDocument();
    });
  });

  it('opens the add activity modal', () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Aktivität hinzufügen'));

    expect(screen.getByText('Aktivität hinzufügen')).toBeInTheDocument();
  });
});