import PropTypes from 'prop-types';

/**
 * Tooltip Component
 * 
 * A simple wrapper component that displays an absolute-positioned tooltip box
 * when hovering over its children. The tooltip appears directly below the target.
 * 
 * @param {Object} props
 * @param {string} props.content - Text to display inside the tooltip.
 * @param {React.ReactNode} props.children - Element the tooltip is attached to.
 * @returns {JSX.Element}
 */
export default function Tooltip({ content, align = 'left', textAlign, position = 'bottom', className = '', tooltipClassName = '', children }) {
    if (!content) return children;

    const alignClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0',
        'start-mobile-end-desktop': 'left-0 md:left-auto md:right-0 md:translate-x-0',
        'center-mobile-end-desktop': 'left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0',
    };

    const resolvedAlign = alignClasses[align] || align;

    let positionClasses = '';
    
    if (position === 'bottom') {
        positionClasses = `top-full mt-2 ${resolvedAlign}`;
    } else if (position === 'top') {
        positionClasses = `bottom-full mb-2 ${resolvedAlign}`;
    } else if (position === 'left') {
        positionClasses = `right-full mr-2 top-1/2 -translate-y-1/2`;
    } else if (position === 'right') {
        positionClasses = `left-full ml-2 top-1/2 -translate-y-1/2`;
    }

    const textAlignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const resolvedTextAlign = textAlign ? (textAlignClasses[textAlign] || 'text-left') : (textAlignClasses[align] || 'text-left');

    return (
        <div className={`relative group ${className}`}>
            {children}
            <div className={`absolute z-50 px-2.5 py-1.5 rounded-[4px] bg-fluent-bg-subtle border border-fluent-stroke-subtle shadow-flyout text-[12px] text-fluent-fg-primary font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out w-max max-w-[min(290px,calc(100vw-24px))] sm:max-w-[320px] whitespace-normal leading-snug ${resolvedTextAlign} ${positionClasses} ${tooltipClassName}`}>
                {content}
            </div>
        </div>
    );
}

Tooltip.propTypes = {
    content: PropTypes.string.isRequired,
    align: PropTypes.oneOf(['left', 'center', 'right', 'start-mobile-end-desktop', 'center-mobile-end-desktop']),
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    position: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),
    className: PropTypes.string,
    tooltipClassName: PropTypes.string,
    children: PropTypes.node.isRequired,
};
