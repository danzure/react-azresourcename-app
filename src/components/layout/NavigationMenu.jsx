import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';

/**
 * NavigationMenu Component
 * 
 * A persistent left-side navigation sidebar on desktop.
 * On mobile, renders as a fixed overlay drawer that slides in from the left.
 * 
 * @param {Object} props
 * @param {boolean} props.isExpanded - Whether the menu is currently expanded.
 * @param {Function} props.onToggleExpand - Callback to toggle the menu expansion.
 * @param {boolean} props.isMobile - Whether the viewport is mobile-sized.
 * @param {Function} props.onClose - Callback to close the mobile drawer.
 * @returns {JSX.Element}
 */
export default function NavigationMenu({ isExpanded, onToggleExpand, isMobile, onClose }) {
    // On mobile: fixed overlay that slides in/out
    // On desktop: inline sidebar that expands/collapses
    const mobileClasses = isMobile
        ? `fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 ease-in-out pt-[48px] pb-[env(safe-area-inset-bottom,0px)] ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`
        : `relative transition-[width] duration-200 ease-in-out ${isExpanded ? 'w-[280px]' : 'w-[64px]'}`;

    const handleNavClick = () => {
        if (isMobile && onClose) onClose();
    };

    return (
        <div
            className={`flex flex-col h-full bg-fluent-bg-card shadow-soft z-40 border-r border-fluent-stroke-subtle ${mobileClasses}`}
            aria-label="Navigation menu"
        >
            {/* Header inside drawer */}
            <div className={`h-[48px] flex items-center border-b border-fluent-stroke-subtle overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${isExpanded ? 'px-4 justify-between' : isMobile ? 'px-4 justify-between' : 'justify-center px-0'}`}>
                {(isExpanded || isMobile) && <span className="font-semibold text-[16px] tracking-tight pl-1">Navigation</span>}
                {isMobile ? (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-fluent-bg-hover text-fluent-fg-secondary hover:text-fluent-fg-primary transition-colors flex-shrink-0"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={onToggleExpand}
                        className="p-1.5 rounded-md hover:bg-fluent-bg-hover text-fluent-fg-secondary hover:text-fluent-fg-primary transition-colors flex-shrink-0"
                        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                        title={isExpanded ? "Collapse menu" : "Expand menu"}
                    >
                        {isExpanded ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-4 space-y-1 overflow-hidden" aria-label="Main navigation">
                <NavLink
                    to="/"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "Dashboard" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/Dashboard.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">Dashboard</span>}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/resource-naming"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "Azure Resources" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/All-Resources.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">Azure Resources</span>}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/conditional-access"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "Conditional Access" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/Conditional-Access.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">Conditional Access</span>}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/management-groups"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "Management Group Topology" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/Management-Groups.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">Management Groups</span>}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/rbac-designer"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "RBAC Designer" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/Azure-AD-Roles-and-Administrators.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">RBAC Designer</span>}
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/tagging-strategy"
                    onClick={handleNavClick}
                    title={!isExpanded && !isMobile ? "Tagging Strategy" : undefined}
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 py-2.5 mx-2 rounded-md text-[15px] transition-all duration-200 ${isExpanded || isMobile ? 'px-3' : 'justify-center px-0'
                        } ${isActive
                            ? 'bg-fluent-bg-subtle text-fluent-brand-fg font-semibold'
                            : 'text-fluent-fg-secondary font-medium hover:bg-fluent-bg-hover hover:text-fluent-fg-primary'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] bg-fluent-brand-bg rounded-full" />
                            )}
                            <img
                                src="https://raw.githubusercontent.com/benc-uk/icon-collection/master/azure-icons/Tags.svg"
                                alt=""
                                className={`w-5 h-5 min-w-[20px] object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} ${!isExpanded && !isMobile ? 'mx-auto' : ''}`}
                                aria-hidden="true"
                            />
                            {(isExpanded || isMobile) && <span className="whitespace-nowrap">Tagging Strategy</span>}
                        </>
                    )}
                </NavLink>
            </nav>


        </div>
    );
}

NavigationMenu.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
    onClose: PropTypes.func,
};

