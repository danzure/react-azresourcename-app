import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * FluentDropdown Component
 * 
 * Standard Microsoft Fluent 2 single-select dropdown component to replace native HTML `<select>`.
 * Adheres strictly to Fluent 2 geometry, semantic color tokens, elevation flyout shadows,
 * active indicator states, and full ARIA keyboard accessibility.
 * 
 * @param {Object} props
 * @param {Array<string|number|{value: any, label: string, disabled?: boolean}>} props.options - Array of options
 * @param {any} props.value - Currently selected value
 * @param {Function} props.onChange - Callback fired when an option is selected
 * @param {string} [props.placeholder="Select..."] - Placeholder when value is empty
 * @param {'standard'|'compact'} [props.size="standard"] - Height sizing ('standard' = 32px, 'compact' = 26px)
 * @param {string} [props.className] - Additional classes for the container
 * @param {string} [props.triggerClassName] - Additional classes for the trigger button
 * @param {string} [props.flyoutClassName] - Additional classes for the flyout popover
 * @param {boolean} [props.disabled=false] - Whether the dropdown is disabled
 * @param {string} [props.ariaLabel] - Accessibility label for screen readers
 */
export default function FluentDropdown({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    size = "standard",
    className = "",
    triggerClassName = "",
    flyoutClassName = "",
    disabled = false,
    ariaLabel
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef(null);
    const listboxRef = useRef(null);

    // Normalize options to [{ value, label, disabled }] format
    const normalizedOptions = useMemo(() => {
        return options.map(opt => {
            if (typeof opt === 'object' && opt !== null) {
                return {
                    value: opt.value !== undefined ? opt.value : opt.suffix,
                    label: opt.label !== undefined ? opt.label : String(opt.value),
                    disabled: Boolean(opt.disabled)
                };
            }
            return {
                value: opt,
                label: String(opt),
                disabled: false
            };
        });
    }, [options]);

    const selectedOption = useMemo(() => {
        return normalizedOptions.find(opt => opt.value === value) || null;
    }, [normalizedOptions, value]);

    // Handle outside click to close and close when another dropdown opens
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        function handleOtherDropdownOpen(event) {
            if (event.detail && event.detail !== containerRef.current) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('fluent-dropdown-open', handleOtherDropdownOpen);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('fluent-dropdown-open', handleOtherDropdownOpen);
        };
    }, [isOpen]);

    // Reset highlighted index when opening/closing and compute placement
    useEffect(() => {
        if (isOpen) {
            const currentIdx = normalizedOptions.findIndex(opt => opt.value === value);
            setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);

            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const estimatedMenuHeight = Math.min(normalizedOptions.length * 36 + 10, 260);
                if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
                    setOpenUpward(true);
                } else {
                    setOpenUpward(false);
                }
            }
        } else {
            setHighlightedIndex(-1);
            setOpenUpward(false);
        }
    }, [isOpen, normalizedOptions, value]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
            const highlightedEl = listboxRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
            if (highlightedEl) {
                highlightedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [isOpen, highlightedIndex]);

    const toggleOpen = useCallback(() => {
        if (disabled) return;
        setIsOpen(prev => {
            const next = !prev;
            if (next && containerRef.current) {
                window.dispatchEvent(new CustomEvent('fluent-dropdown-open', { detail: containerRef.current }));
            }
            return next;
        });
    }, [disabled]);

    const handleSelect = useCallback((val) => {
        if (disabled) return;
        onChange?.(val);
        setIsOpen(false);
    }, [disabled, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (disabled) return;

        if (!isOpen) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
                if (containerRef.current) {
                    window.dispatchEvent(new CustomEvent('fluent-dropdown-open', { detail: containerRef.current }));
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    let next = prev + 1;
                    while (next < normalizedOptions.length && normalizedOptions[next].disabled) {
                        next++;
                    }
                    return next < normalizedOptions.length ? next : prev;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    let next = prev - 1;
                    while (next >= 0 && normalizedOptions[next].disabled) {
                        next--;
                    }
                    return next >= 0 ? next : prev;
                });
                break;
            case 'Home':
                e.preventDefault();
                setHighlightedIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setHighlightedIndex(normalizedOptions.length - 1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
                    const opt = normalizedOptions[highlightedIndex];
                    if (!opt.disabled) {
                        handleSelect(opt.value);
                    }
                }
                break;
            case 'Escape':
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    }, [disabled, isOpen, highlightedIndex, normalizedOptions, handleSelect]);

    const isCompact = size === 'compact';
    const heightClass = isCompact ? 'h-[26px]' : 'h-[32px]';
    const textClass = isCompact ? 'text-[12px]' : 'text-[13px]';
    const paddingClass = isCompact ? 'px-2' : 'px-3';

    return (
        <div 
            ref={containerRef} 
            className={`relative inline-block min-w-0 ${isOpen ? 'z-50' : ''} ${className}`}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={ariaLabel || (typeof placeholder === 'string' ? placeholder : 'Dropdown')}
                className={`w-full flex items-center justify-between gap-1.5 ${paddingClass} ${heightClass} ${textClass} rounded-[4px] border transition-all text-left outline-none cursor-pointer select-none bg-fluent-bg-card text-fluent-fg-primary ${
                    disabled 
                        ? 'opacity-50 cursor-not-allowed bg-fluent-bg-subtle border-fluent-stroke-subtle text-fluent-fg-tertiary' 
                        : isOpen 
                            ? 'border-b-2 border-b-fluent-brand-bg border-x-transparent border-t-transparent shadow-sm' 
                            : 'border-fluent-stroke-strong hover:border-fluent-fg-primary'
                } ${triggerClassName}`}
            >
                <span className={`truncate flex-1 ${!selectedOption ? 'text-fluent-fg-tertiary' : 'font-normal text-fluent-fg-primary'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    className={`w-3.5 h-3.5 shrink-0 text-fluent-fg-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180 text-fluent-brand-fg' : ''}`} 
                    aria-hidden="true" 
                />
            </button>

            {isOpen && (
                <div
                    ref={listboxRef}
                    role="listbox"
                    aria-label={ariaLabel}
                    className={`absolute ${openUpward ? 'bottom-[100%] mb-1' : 'top-[100%] mt-1'} left-0 z-50 min-w-full w-max max-w-[420px] max-h-[260px] overflow-y-auto rounded bg-fluent-bg-card border border-fluent-stroke-subtle shadow-flyout py-1 animate-fade-in ${flyoutClassName}`}
                >
                    {normalizedOptions.length === 0 ? (
                        <div className={`px-3 py-2 ${textClass} text-fluent-fg-tertiary`}>
                            No options
                        </div>
                    ) : (
                        normalizedOptions.map((opt, index) => {
                            const isSelected = selectedOption && selectedOption.value === opt.value;
                            const isHighlighted = highlightedIndex === index;

                            return (
                                <div
                                    key={opt.value !== undefined ? String(opt.value) : index}
                                    data-index={index}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={opt.disabled}
                                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                                    className={`flex items-center justify-between gap-3 px-3 ${isCompact ? 'py-1.5' : 'py-2'} ${textClass} cursor-pointer transition-colors ${
                                        opt.disabled
                                            ? 'opacity-40 cursor-not-allowed text-fluent-fg-tertiary'
                                            : isHighlighted
                                                ? 'bg-fluent-bg-hover text-fluent-fg-primary'
                                                : isSelected
                                                    ? 'bg-fluent-bg-subtle text-fluent-fg-primary font-medium'
                                                    : 'text-fluent-fg-secondary hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                                    }`}
                                >
                                    <span className="truncate flex-1">{opt.label}</span>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-fluent-brand-fg shrink-0" aria-hidden="true" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

FluentDropdown.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.shape({
                value: PropTypes.any,
                label: PropTypes.string,
                suffix: PropTypes.string,
                disabled: PropTypes.bool
            })
        ])
    ).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['standard', 'compact']),
    className: PropTypes.string,
    triggerClassName: PropTypes.string,
    flyoutClassName: PropTypes.string,
    disabled: PropTypes.bool,
    ariaLabel: PropTypes.string
};
