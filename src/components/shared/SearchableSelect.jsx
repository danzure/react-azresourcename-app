import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Check, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import PropTypes from 'prop-types';

/**
 * SearchableSelect Component
 * 
 * A custom dropdown component featuring a searchable input to filter items.
 * Supports grouping with 'header' type items, abbreviated labels, and 
 * an optional compact mode where the external label is hidden.
 * 
 * Accessibility features:
 * - Full keyboard navigation (ArrowUp/Down, Enter, Escape, Home, End)
 * - ARIA combobox pattern (role="combobox", role="listbox", role="option")
 * - aria-expanded, aria-activedescendant, aria-selected attributes
 * - Highlighted option automatically scrolls into view
 * 
 * @param {Object} props
 * @param {Array<{label: string, value?: string, type?: string, abbrev?: string}>} props.items - Array of dropdown options.
 * @param {string} props.value - Currently selected item value.
 * @param {Function} props.onChange - Callback fired when a new item is selected.
 * @param {string} [props.label] - External label text.
 * @param {string} [props.placeholder="Select..."] - Search input placeholder text.
 * @param {string} [props.description] - Tooltip description text shown on hover of the label.
 * @param {boolean} [props.compact] - If true, hides external label and adapts height to match input fields.
 * @returns {JSX.Element}
 */
export default function SearchableSelect({ items, value, onChange, label, placeholder = "Select...", description, compact }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openUpward, setOpenUpward] = useState(false);
    const wrapperRef = useRef(null);
    const listboxRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedItem = items.find(i => i.value === value && !i.type) || items.find(i => !i.type);

    const filteredItems = useMemo(() => {
        if (!search) return items;
        const lowerSearch = search.toLowerCase();
        return items.filter(i => {
            if (i.type === 'header') return true;
            return String(i.label).toLowerCase().includes(lowerSearch);
        });
    }, [items, search]);

    // Get only selectable (non-header) items for keyboard navigation
    const selectableItems = useMemo(() => {
        return filteredItems.filter(i => i.type !== 'header');
    }, [filteredItems]);

    // Reset highlight when filtered items change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [search]);

    // Reset highlight and compute upward placement when dropdown opens/closes
    useEffect(() => {
        if (!isOpen) {
            setHighlightedIndex(-1);
            setSearch('');
            setOpenUpward(false);
        } else {
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const estimatedMenuHeight = 320;
                if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
                    setOpenUpward(true);
                } else {
                    setOpenUpward(false);
                }
            }
        }
    }, [isOpen]);

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listboxRef.current) {
            const highlighted = listboxRef.current.querySelector('[data-highlighted="true"]');
            if (highlighted) {
                highlighted.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectItem = useCallback((itemValue) => {
        onChange(itemValue);
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
    }, [onChange]);

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) {
            // Open on ArrowDown, ArrowUp, Enter, or Space when closed
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    const next = prev + 1;
                    return next >= selectableItems.length ? 0 : next;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    const next = prev - 1;
                    return next < 0 ? selectableItems.length - 1 : next;
                });
                break;
            case 'Home':
                e.preventDefault();
                setHighlightedIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setHighlightedIndex(selectableItems.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < selectableItems.length) {
                    selectItem(selectableItems[highlightedIndex].value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    }, [isOpen, highlightedIndex, selectableItems, selectItem]);

    // Generate a unique listbox ID for aria-controls / aria-activedescendant
    const listboxId = useMemo(() => `searchable-select-${label || 'compact'}-listbox`, [label]);

    const activeDescendant = highlightedIndex >= 0 && selectableItems[highlightedIndex]
        ? `${listboxId}-option-${selectableItems[highlightedIndex].value}`
        : undefined;

    // Shared dropdown panel renderer
    // Shared dropdown panel renderer
    const renderDropdown = () => (
        <div
            className={`absolute ${openUpward ? 'bottom-[100%] mb-1' : 'top-[100%] mt-1'} left-0 right-0 z-[100] shadow-flyout border rounded overflow-hidden bg-fluent-bg-card border-fluent-stroke-subtle animate-fade-in`}
            role="presentation"
        >
            <div className="p-2 border-b border-fluent-stroke-subtle">
                <input
                    ref={searchInputRef}
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`w-full px-2 py-1.5 ${compact ? 'text-[13px]' : 'text-[14px]'} border-b outline-none bg-transparent text-fluent-fg-primary border-fluent-stroke-subtle placeholder:text-fluent-fg-tertiary`}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-activedescendant={activeDescendant}
                    aria-autocomplete="list"
                    aria-label={label || 'Search and select'}
                />
            </div>
            <div
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-label={label || 'Options'}
                className="max-h-[300px] overflow-y-auto scroll-smooth"
            >
                {filteredItems.map((item, idx) => {
                    if (item.type === 'header') {
                        const nextItem = filteredItems[idx + 1];
                        if (!nextItem || nextItem.type === 'header') return null;
                        return (
                            <div
                                key={`header-${item.label}`}
                                role="presentation"
                                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 bg-fluent-bg-canvas/90 text-fluent-fg-tertiary"
                            >
                                {item.label}
                            </div>
                        );
                    }

                    const selectableIdx = selectableItems.indexOf(item);
                    const isHighlighted = selectableIdx === highlightedIndex;
                    const isSelected = value === item.value;

                    return (
                        <div
                            key={item.value}
                            id={`${listboxId}-option-${item.value}`}
                            role="option"
                            aria-selected={isSelected}
                            data-highlighted={isHighlighted}
                            onClick={() => selectItem(item.value)}
                            onMouseEnter={() => setHighlightedIndex(selectableIdx)}
                            className={`flex items-center justify-between px-3 py-2.5 ${compact ? 'text-[13px]' : 'text-[14px]'} cursor-pointer transition-colors ${
                                isHighlighted
                                    ? 'bg-fluent-bg-hover text-fluent-fg-primary'
                                    : isSelected
                                        ? 'bg-fluent-bg-subtle text-fluent-fg-primary font-semibold'
                                        : 'text-fluent-fg-secondary hover:bg-fluent-bg-hover'
                            }`}
                        >
                            <span>{item.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-fluent-brand-fg" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Compact mode: no label, standard height matching inputs
    if (compact) {
        return (
            <div ref={wrapperRef} className={`relative w-full ${isOpen ? 'z-50' : ''}`}>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-label={label || 'Select an option'}
                    className={`w-full flex items-center justify-between px-3 h-[32px] cursor-pointer transition-all border rounded text-[14px] bg-fluent-bg-card ${isOpen ? 'border-b-2 border-b-fluent-brand-bg border-x-transparent border-t-transparent' : 'border-fluent-stroke-strong hover:border-fluent-fg-primary'}`}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        <span className="text-fluent-fg-primary">{selectedItem?.label}</span>
                        {selectedItem?.abbrev && <span className="text-[12px] text-fluent-fg-tertiary">({selectedItem.abbrev})</span>}
                    </div>
                    <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>

                {isOpen && renderDropdown()}
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className={`relative flex-1 group min-w-[200px] flex flex-col gap-2 ${isOpen ? 'z-50' : ''}`}>
            <Tooltip content={description}>
                <div className="flex items-center gap-1">
                    <label id={`${listboxId}-label`} className="block text-[14px] font-semibold cursor-help text-fluent-fg-primary">{label}</label>
                    <HelpCircle className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity text-fluent-fg-tertiary" aria-hidden="true" />
                </div>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-labelledby={`${listboxId}-label`}
                    className={`flex items-center justify-between px-3 h-[32px] cursor-pointer transition-all border rounded text-[14px] bg-fluent-bg-card ${isOpen ? 'border-b-2 border-b-fluent-brand-bg border-x-transparent border-t-transparent' : 'border-fluent-stroke-strong hover:border-fluent-fg-primary'}`}
                >
                    <div className="flex items-center gap-2 truncate">
                        <span className="text-fluent-fg-primary">{selectedItem?.label}</span>
                        {selectedItem?.abbrev && <span className="text-[12px] text-fluent-fg-tertiary">({selectedItem.abbrev})</span>}
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
            </Tooltip>

            {isOpen && renderDropdown()}
        </div>
    );
}

SearchableSelect.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string,
        type: PropTypes.string,
        abbrev: PropTypes.string,
    })).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    description: PropTypes.string,
    compact: PropTypes.bool,
};
