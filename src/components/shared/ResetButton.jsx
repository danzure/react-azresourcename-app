import PropTypes from 'prop-types';

/**
 * Standardized Fluent 2 Reset Button component.
 * Features accessible focus rings and unified button geometry aligned with Cloud Adoption Framework design standards.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback executed when the button is clicked.
 * @param {React.ReactNode} [props.children='Reset Defaults'] - Button label or nested content.
 * @param {string} [props.title='Reset to defaults'] - Tooltip title text.
 * @param {string} [props.className=''] - Additional custom CSS classes.
 * @param {string} [props.ariaLabel] - Explicit accessibility label.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 */
export default function ResetButton({
    onClick,
    children = 'Reset Defaults',
    title = 'Reset to defaults',
    className = '',
    ariaLabel,
    disabled = false
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || (typeof children === 'string' ? children : title)}
            title={title}
            className={`h-[32px] px-3 rounded-[4px] border border-fluent-stroke-subtle hover:border-fluent-stroke-strong bg-fluent-bg-card hover:bg-fluent-bg-hover text-fluent-fg-secondary hover:text-fluent-fg-primary text-[12px] font-medium transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-fluent-bg-subtle disabled:border-fluent-stroke-subtle disabled:text-fluent-fg-tertiary ${className}`}
        >
            {children}
        </button>
    );
}

ResetButton.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node,
    title: PropTypes.string,
    className: PropTypes.string,
    ariaLabel: PropTypes.string,
    disabled: PropTypes.bool
};
