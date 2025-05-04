// tests/unit/RoleHandbook.test.tsx
import { fetchRoleData } from '../../src/features/reporting/pages/RoleHandbook';

describe('fetchRoleData', () => {
  const setRoleData = jest.fn();
  const roles = [{ _id: '123', name: 'Test Role', subordinateRoles: [] }];

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches role data and updates state', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    await fetchRoleData('123', roles, setRoleData);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/activities');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/roles');
    expect(setRoleData).toHaveBeenCalledWith({
      _id: '123',
      name: 'Test Role',
      activities: [],
      subordinateRoles: [],
    });
  });

  it('handles errors gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: false,
      });
    });

    await fetchRoleData('123', roles, setRoleData);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Nur ein Aufruf sollte stattfinden
    expect(setRoleData).toHaveBeenCalledWith(null);
  });
});