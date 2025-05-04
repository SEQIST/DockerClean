// src/features/activities/components/CustomAutocomplete.tsx
import React, { useState, useEffect, useRef } from 'react';

interface CustomAutocompleteProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getOptionLabel: (option: T) => string;
  placeholder: string;
  disabled?: boolean;
}

const CustomAutocomplete = <T,>({ options, value, onChange, getOptionLabel, placeholder, disabled = false }: CustomAutocompleteProps<T>) => {
  const [inputValue, setInputValue] = useState<string>(value ? getOptionLabel(value) : '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value ? getOptionLabel(value) : '');
  }, [value, getOptionLabel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (option: T | null) => {
    onChange(option);
    setInputValue(option ? getOptionLabel(option) : '');
    setIsOpen(false);
  };

  const filteredOptions = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
  );

  if (disabled && value) {
    return (
      <div className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
        {getOptionLabel(value)}
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {getOptionLabel(option)}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Keine Ergebnisse gefunden
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomAutocomplete;