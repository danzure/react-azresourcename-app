import PropTypes from 'prop-types';

export default function Tooltip({ content, children, isDarkMode }) {
    if (!content) return children;

    return (
        <div className="relative group">
            {children}
            <div className={`absolute left-0 top-full mt-1 px-2 py-1 text-[11px] rounded shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 ${isDarkMode ? 'bg-[#323130] text-white' : 'bg-[#323130] text-white'}`}>
                {content}
            </div>
        </div>
    );
}

Tooltip.propTypes = {
    content: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
};
