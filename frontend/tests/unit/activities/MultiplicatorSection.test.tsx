// src/features/activities/components/__tests__/MultiplicatorSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiplicatorSection from '../../../src/features/activities/components/MultiplicatorSection';
import { Activity } from '../../../src/features/processes/services/processService';

describe('MultiplicatorSection', () => {
  const mockActivity: Activity = {
    _id: '123',
    name: 'Test Activity',
    process: null, // Erforderliches Feld hinzufügen
    executedBy: null,
    result: null,
    roles: [],
    trigger: { workProducts: [], andOr: 'AND', timeTrigger: { unit: 'sec', value: 0, repetition: '' }, determiningFactorId: null },
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
  const setActivity = jest.fn();

  it('renders the multiplicator section', () => {
    render(
      <MultiplicatorSection activity={mockActivity} setActivity={setActivity} />
    );

    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('multiply')).toBeChecked();
  });

  it('updates the multiplicator value', () => {
    render(
      <MultiplicatorSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '5' } });

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      multiplicator: 5,
    }));
  });

  it('updates the compressor type', () => {
    render(
      <MultiplicatorSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.click(screen.getByText('divide'));

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      compressor: 'divide',
    }));
  });
});