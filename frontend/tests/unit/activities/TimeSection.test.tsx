// src/features/activities/components/__tests__/TimeSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeSection from '../TimeSection';
import { Activity } from '../../../processes/services/processService'; // Typ aus processService importieren

describe('TimeSection', () => {
  const mockActivity: Activity = {
    _id: '123',
    name: 'Test Activity',
    process: null,
    executedBy: null,
    result: null,
    roles: [],
    trigger: { workProducts: [], andOr: 'AND', timeTrigger: { unit: 'sec', value: 0, repetition: '' }, determiningFactorId: null },
    knownTime: 2,
    estimatedTime: 2,
    timeUnit: 'minutes',
    multiplicator: 1,
    compressor: 'multiply',
    executionMode: 'parallel',
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

  it('renders the time section', () => {
    render(
      <TimeSection activity={mockActivity} setActivity={setActivity} />
    );

    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('minutes')).toBeInTheDocument();
  });

  it('updates the known time', () => {
    render(
      <TimeSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.change(screen.getAllByDisplayValue('2')[0], { target: { value: '5' } });

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      knownTime: 5,
    }));
  });

  it('updates the time unit', () => {
    render(
      <TimeSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.change(screen.getByDisplayValue('minutes'), { target: { value: 'hours' } });

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      timeUnit: 'hours',
    }));
  });
});