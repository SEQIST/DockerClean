import { runQuery } from '../../src/features/reporting/components/QueryRunner';

describe('runQuery', () => {
  const setResults = jest.fn();
  const setDependentResults = jest.fn();
  const selectedTable = 'activities';
  const conditions = [{ field: 'name', value: '' }];
  const dependentTables: { table: string; fields: string[] }[] = [];
  const queryTables = [
    { name: 'activities', label: 'Aktivitäten', fields: [{ name: 'name', label: 'Name' }] },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ _id: '1', name: 'Test Activity' }]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and filters results correctly', async () => {
    await runQuery(selectedTable, conditions, dependentTables, setResults, setDependentResults, queryTables);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/activities');
    expect(setResults).toHaveBeenCalledWith([{ _id: '1', name: 'Test Activity' }]);
  });

  it('handles errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });
    await runQuery(selectedTable, conditions, dependentTables, setResults, setDependentResults, queryTables);
    expect(setResults).toHaveBeenCalledWith([]);
    expect(setDependentResults).toHaveBeenCalledWith([]);
  });
});