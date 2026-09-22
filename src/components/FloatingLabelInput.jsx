'use client';

import React, { useState, forwardRef } from 'react';

/**
 * FloatingLabelInput
 * A modern floating-label input component where the label smoothly moves above the input
 * text when the field is focused or contains a value.
 */
const FloatingLabelInput = forwardRef(function FloatingLabelInput(
  {
    id,
    label,
    as = 'input',
    type = 'text',
    value = '',
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    placeholder = '',
    required = false,
    disabled = false,
    autoComplete,
    minLength,
    maxLength,
    inputMode,
    pattern,
    rows = 3,
    icon: Icon,
    rightElement,
    error,
    helperText,
    className = '',
    inputClassName = '',
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const stringVal = value !== undefined && value !== null ? String(value) : '';
  const hasValue = stringVal.length > 0;
  const isFloating = isFocused || hasValue;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const hasLeftIcon = Boolean(Icon);
  const hasRightElement = Boolean(rightElement);
  const isTextarea = as === 'textarea';

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`relative flex ${isTextarea ? 'items-start' : 'items-center'} w-full rounded-xl border transition-all duration-200 ${
          error
            ? 'border-error-500 bg-error-50/20 dark:bg-error-950/20'
            : isFocused
            ? 'border-amber-500 bg-white dark:bg-gray-900 ring-2 ring-amber-500/20 shadow-xs'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Left Icon */}
        {hasLeftIcon && (
          <div
            className={`absolute left-3.5 ${
              isTextarea ? 'top-3.5' : 'top-1/2 -translate-y-1/2'
            } pointer-events-none transition-colors duration-200 ${
              error
                ? 'text-error-500'
                : isFocused
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={id}
            className={`absolute pointer-events-none select-none transition-all duration-200 ease-out ${
              hasLeftIcon ? 'left-10' : 'left-3.5'
            } ${
              isFloating
                ? 'top-1.5 text-[10px] font-bold uppercase tracking-wider'
                : isTextarea
                ? 'top-3 text-sm font-normal'
                : 'top-1/2 -translate-y-1/2 text-sm font-normal'
            } ${
              error
                ? 'text-error-600 dark:text-error-400'
                : isFocused
                ? 'text-amber-600 dark:text-amber-400'
                : isFloating
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {label}
            {required && <span className="ml-0.5 text-amber-500">*</span>}
          </label>
        )}

        {/* Input or Textarea Field */}
        {isTextarea ? (
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={isFloating ? placeholder : ''}
            className={`w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-all resize-none ${
              label ? 'pt-6 pb-2' : 'py-2.5'
            } ${hasLeftIcon ? 'pl-10' : 'pl-3.5'} ${
              hasRightElement ? 'pr-11' : 'pr-3.5'
            } ${inputClassName}`}
            {...rest}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            minLength={minLength}
            maxLength={maxLength}
            inputMode={inputMode}
            pattern={pattern}
            placeholder={isFloating ? placeholder : ''}
            className={`w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-all ${
              label ? 'pt-5 pb-1.5' : 'py-2.5'
            } ${hasLeftIcon ? 'pl-10' : 'pl-3.5'} ${
              hasRightElement ? 'pr-11' : 'pr-3.5'
            } ${inputClassName}`}
            {...rest}
          />
        )}

        {/* Right Element (Toggle buttons, icons, indicators) */}
        {hasRightElement && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper or Error Text */}
      {error && typeof error === 'string' && (
        <p className="mt-1 text-xs font-medium text-error-600 dark:text-error-400 animate-fadeIn">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default FloatingLabelInput;
