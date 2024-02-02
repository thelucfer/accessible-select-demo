import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { checkExhaustive } from '../utils';
import styles from './Select.module.css';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps<T> = {
  inputValue: string;
  setInputValue: (newValue: string) => void;
  selectId: string;
  selectName: string;
  placeholder?: string;
  values: Array<T> | undefined;
  toOption: (value: T) => SelectOption;
  initialValue?: T;
  onOptionSelected?: (newValue: T | undefined) => void;
  renderOption?: (option: SelectOption) => JSX.Element;
  isLoading?: boolean;
};

const getOption = (
  option: SelectOption | undefined,
  renderOption?: (option: SelectOption) => JSX.Element,
) => {
  if (!option) return null;

  if (renderOption) {
    return renderOption(option);
  }

  return option.label;
};

export const Select = <T,>({
  inputValue,
  setInputValue,
  selectId,
  selectName,
  placeholder = 'Select an option...',
  values = [],
  toOption,
  initialValue,
  onOptionSelected,
  renderOption,
  isLoading,
}: SelectProps<T>) => {
  const [showOptions, setShowOptions] = useState(false);
  const [shouldUpdateInput, setShouldUpdateInput] = useState(true);
  const [currentFocusedOption, setCurrentFocusedOption] = useState(-1);

  const inputRef = useRef<HTMLDivElement>(null);
  const debounce = useDebounce();

  const options = values.map(toOption);

  const [selectedOption, setSelectedOption] = useState<SelectOption>(
    initialValue ? toOption(initialValue) : options[0],
  );

  const filteredOptions = useMemo(() => {
    if (inputValue.length === 0 || !options) {
      return options;
    }

    const includesSubstring = (compared: string) => (base: string) =>
      base.toLowerCase().includes(compared.toLowerCase());

    return options.filter((option) => {
      const includesInputValue = includesSubstring(inputValue);

      return includesInputValue(option.label) || includesInputValue(option.value ?? '');
    });
  }, [inputValue, options]);

  const handleOptionClick = (option: SelectOption) => {
    setSelectedOption(option);
    setShouldUpdateInput(true);
  };

  const handleFocus = () => {
    setInputValue('');
    setShowOptions(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const specialKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'] as const;
    type SpecialKey = (typeof specialKeys)[number];

    const isSpecialKey = (key: string): key is SpecialKey =>
      specialKeys.includes(key as SpecialKey);

    if (!options || !isSpecialKey(e.key)) {
      return;
    }

    if (!showOptions) {
      if (e.key === 'Escape') return;

      setShowOptions(true);
      return;
    }

    switch (e.key) {
      case 'Escape': {
        setShouldUpdateInput(true);
        e.stopPropagation();
        return;
      }

      case 'ArrowDown': {
        setCurrentFocusedOption((prev) => (prev + 1) % filteredOptions.length);
        return;
      }

      case 'ArrowUp': {
        setCurrentFocusedOption(
          (prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length,
        );
        return;
      }

      case 'Enter': {
        if (currentFocusedOption === -1) {
          return;
        }
        e.preventDefault();

        setSelectedOption((prev) => filteredOptions[currentFocusedOption] ?? prev);
        setShouldUpdateInput(true);

        return;
      }

      default:
        checkExhaustive(e.key);
    }
  };

  const handleBlur = debounce(() => {
    if (shouldUpdateInput) return;

    setShouldUpdateInput(true);
  }, 150);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (!shouldUpdateInput) return;

    setInputValue(selectedOption?.label ?? '');

    setShouldUpdateInput(false);
    setShowOptions(false);
    setCurrentFocusedOption(-1);
  }, [selectedOption?.label, setInputValue, shouldUpdateInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current?.contains(e.target as Node)) return;

      setShowOptions(false);
      setShouldUpdateInput(true);
    };

    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!onOptionSelected || !selectedOption || !values) return;

    const toValue = (option: SelectOption) =>
      values.find((value) => toOption(value).value === option.value);

    onOptionSelected(toValue(selectedOption));
  }, [onOptionSelected, selectedOption, toOption, values]);

  return (
    <div id={selectId} className={styles.container} ref={inputRef}>
      <label htmlFor={`${selectId}__input`} className={styles.label}>
        {selectName}
      </label>
      <input
        className={styles.input}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => handleBlur()}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {isLoading && <div className={styles['loading-indicator']}>...</div>}
      <button type="button" tabIndex={-1} onClick={handleFocus} className={styles.button_toggle}>
        {!showOptions ? (
          <svg width="18" height="16" aria-hidden="true" focusable="false">
            <polygon
              className="arrow"
              strokeWidth="0"
              fillOpacity="0.75"
              fill="currentcolor"
              points="3,6 15,6 9,14"
            />
          </svg>
        ) : (
          <svg
            width="18"
            height="16"
            aria-hidden="true"
            focusable="false"
            style={{
              transform: 'rotate(180deg)',
            }}
          >
            <polygon
              className="arrow"
              strokeWidth="0"
              fillOpacity="0.75"
              fill="currentcolor"
              points="3,6 15,6 9,14"
            />
          </svg>
        )}
      </button>
      {showOptions && (
        <ul
          id={`${selectId}__list`}
          className={styles.option__list}
          aria-label={selectName}
          role="listbox"
        >
          {isLoading && <li className={styles.loading_options_placeholder}>loading options...</li>}

          {filteredOptions?.length > 0 &&
            filteredOptions.map((option, index) => (
              <li
                className={styles.option__list__item}
                key={`${selectId}__list-option--${option.value}`}
                role="option"
                aria-selected={index === currentFocusedOption}
              >
                <button
                  type="button"
                  className={styles.option__list__item__button}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setCurrentFocusedOption(index)}
                >
                  {getOption(option, renderOption)}
                </button>
              </li>
            ))}

          {(!filteredOptions || filteredOptions.length === 0) && !isLoading && (
            <li className={styles.loading_options_placeholder}>no options</li>
          )}
        </ul>
      )}
    </div>
  );
};
