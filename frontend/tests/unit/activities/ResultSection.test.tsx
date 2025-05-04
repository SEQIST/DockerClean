// src/features/activities/components/__tests__/ResultSection.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultSection from '../ResultSection';
import { WorkProduct, Activity } from '../../../processes/services/processService';

describe('ResultSection', () => {
  const mockActivity: Activity = {
    _id: '123',
    name: 'Test Activity',
    process: null, // Erforderliches Feld hinzufügen
    executedBy: null,
    result: 'wp1',
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
  const mockWorkProducts: WorkProduct[] = [
    { _id: 'wp1', name: 'Work Product 1', description: '' },
    { _id: 'wp2', name: 'Work Product 2', description: '' },
  ];
  const handleChange = jest.fn();
  const handleAddNewWorkProductForResult = jest.fn();

  it('renders the result work product', () => {
    render(
      <ResultSection
        activity={mockActivity}
        workProducts={mockWorkProducts}
        handleChange={handleChange}
        handleAddNewWorkProductForResult={handleAddNewWorkProductForResult}
      />
    );

    expect(screen.getByText('Work Product 1')).toBeInTheDocument();
  });

  it('calls handleAddNewWorkProductForResult on button click', () => {
    render(
      <ResultSection
        activity={mockActivity}
        workProducts={mockWorkProducts}
        handleChange={handleChange}
        handleAddNewWorkProductForResult={handleAddNewWorkProductForResult}
      />
    );

    fireEvent.click(screen.getByText('+ Neues Work Product'));

    expect(handleAddNewWorkProductForResult).toHaveBeenCalled();
  });
});