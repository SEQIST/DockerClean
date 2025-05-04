// src/features/activities/components/__tests__/TriggerSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TriggerSection from '../TriggerSection';
import { Activity, WorkProduct } from '../../../processes/services/processService';

describe('TriggerSection', () => {
  const mockActivity: Activity = {
    _id: '123',
    name: 'Test Activity',
    process: null, // Erforderliches Feld hinzufügen
    executedBy: null,
    result: 'wp2',
    roles: [],
    trigger: {
      workProducts: [{ _id: 'wp1', completionPercentage: 50, isWorkloadDetermining: true }],
      andOr: 'AND',
      timeTrigger: { unit: 'sec', value: 0, repetition: '' },
      determiningFactorId: null,
    },
    multiplicator: 1,
    compressor: 'multiply',
    executionMode: 'parallel',
    knownTime: 0,
    estimatedTime: 0,
    timeUnit: 'minutes',
    versionMajor: 1,
    versionMinor: 0,
    icon: '',
    description: '',
    abbreviation: '',
    timeFactor: 0,
    duration: 0,
    effort: 0,
  };

  const mockWorkProducts: WorkProduct[] = [
    { _id: 'wp1', name: 'Work Product 1', description: '' },
    { _id: 'wp2', name: 'Work Product 2', description: '' },
  ];

  const setActivity = jest.fn();

  it('renders trigger work products', () => {
    render(
      <TriggerSection
        activity={mockActivity}
        setActivity={setActivity}
        availableWorkProductsForTrigger={mockWorkProducts}
        allWorkProducts={mockWorkProducts}
      />
    );

    expect(screen.getByText('Work Product 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('adds a new work product trigger', () => {
    render(
      <TriggerSection
        activity={mockActivity}
        setActivity={setActivity}
        availableWorkProductsForTrigger={mockWorkProducts}
        allWorkProducts={mockWorkProducts}
      />
    );

    fireEvent.click(screen.getByText('+ Neues WP hinzufügen'));

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      trigger: expect.objectContaining({
        workProducts: expect.arrayContaining([
          expect.objectContaining({ _id: 'wp1', completionPercentage: 50, isWorkloadDetermining: true }),
          expect.objectContaining({ _id: '', completionPercentage: 100, isWorkloadDetermining: false }),
        ]),
      }),
    }));
  });

  it('removes a work product trigger', () => {
    render(
      <TriggerSection
        activity={mockActivity}
        setActivity={setActivity}
        availableWorkProductsForTrigger={mockWorkProducts}
        allWorkProducts={mockWorkProducts}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      trigger: expect.objectContaining({
        workProducts: [],
      }),
    }));
  });
});