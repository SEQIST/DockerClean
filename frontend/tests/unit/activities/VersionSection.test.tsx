// src/features/activities/components/__tests__/VersionSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VersionSection from '../../../src/features/activities/components/VersionSection';
import { Activity } from '../../../src/features/processes/services/processService'; // Typ aus processService importieren

describe('VersionSection', () => {
  const mockActivity: Activity = {
    _id: '123',
    name: 'Test Activity',
    process: null,
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

  it('renders the version section', () => {
    render(
      <VersionSection activity={mockActivity} setActivity={setActivity} />
    );

    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('updates the version major', () => {
    render(
      <VersionSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '2' } });

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      versionMajor: 2,
    }));
  });

  it('updates the version minor', () => {
    render(
      <VersionSection activity={mockActivity} setActivity={setActivity} />
    );

    fireEvent.change(screen.getByDisplayValue('0'), { target: { value: '1' } });

    expect(setActivity).toHaveBeenCalledWith(expect.objectContaining({
      versionMinor: 1,
    }));
  });
});