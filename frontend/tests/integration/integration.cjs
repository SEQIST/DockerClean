import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import QueryEditor from '../../src/features/reporting/pages/QueryEditor';

const server = setupServer(
  http.get('http://localhost:5001/api/activities', () => {
    return HttpResponse.json([{ _id: '1', name: 'Test Activity' }]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('QueryEditor displays results after running query', async () => {
  render(<QueryEditor />);
  const runButton = screen.getByText('Abfrage ausführen');
  await userEvent.click(runButton);
  await waitFor(() => {
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });
});