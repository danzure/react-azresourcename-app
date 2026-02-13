import { memo, useEffect, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import ResourceCard from './ResourceCard';

/**
 * Virtualized grid component for rendering resource cards efficiently
 * Uses react-window for virtual scrolling to improve performance with 100+ items
 */
function VirtualizedResourceGrid({
    filteredResources,
    generateName,
    subResourceSelections,
    copiedId,
    expandedCard,
    isDarkMode,
    copyToClipboard,
    handleCardToggle,
    handleSubResourceChange
}) {
    const [gridDimensions, setGridDimensions] = useState({ columnCount: 4, width: 0, height: 0 });

    // Calculate grid dimensions based on viewport
    useEffect(() => {
        const calculateDimensions = () => {
            const width = window.innerWidth;
            const containerWidth = Math.min(width - 48, 1600); // max-w-[1600px] mx-auto px-6

            let columnCount = 4; // xl:grid-cols-4
            if (width < 640) columnCount = 1; // default
            else if (width < 768) columnCount = 1; // md:grid-cols-2
            else if (width < 1024) columnCount = 2; // md:grid-cols-2
            else if (width < 1280) columnCount = 3; // lg:grid-cols-3

            const height = window.innerHeight - 400; // Account for header and config panel

            setGridDimensions({ columnCount, width: containerWidth, height: Math.max(height, 600) });
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
    }, []);

    const { columnCount, width, height } = gridDimensions;
    const rowCount = Math.ceil(filteredResources.length / columnCount);
    const columnWidth = (width - (16 * (columnCount - 1))) / columnCount; // Account for gaps
    const rowHeight = 220; // Approximate card height + gap

    // Cell renderer for the grid
    const Cell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= filteredResources.length) return null;

        const resource = filteredResources[index];
        const selectedSubResource = subResourceSelections[resource.name] || (resource.subResources?.[0]?.suffix);
        const genName = generateName(resource, selectedSubResource);
        const isCopied = copiedId === resource.name;
        const isExpanded = expandedCard === resource.name;
        const isTooLong = resource.maxLength && genName.length > resource.maxLength;
        const staggerClass = index < 10 ? `stagger-${index + 1}` : '';

        // Handle expanded cards by rendering full-width
        if (isExpanded) {
            return (
                <div
                    style={{
                        ...style,
                        left: 0,
                        width: '100%',
                        zIndex: 10
                    }}
                    className={`animate-fade-in opacity-0 ${staggerClass}`}
                >
                    <div style={{ padding: '8px' }}>
                        <ResourceCard
                            id={`resource-${resource.name}`}
                            resource={resource}
                            genName={genName}
                            isCopied={isCopied}
                            isExpanded={isExpanded}
                            isTooLong={isTooLong}
                            isDarkMode={isDarkMode}
                            onCopy={(e) => copyToClipboard(genName, resource.name, e)}
                            onToggle={() => handleCardToggle(resource.name, isExpanded)}
                            selectedSubResource={selectedSubResource}
                            onSubResourceChange={(suffix) => handleSubResourceChange(resource.name, suffix)}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div
                style={{
                    ...style,
                    padding: '8px'
                }}
                className={`animate-fade-in opacity-0 ${staggerClass}`}
            >
                <ResourceCard
                    id={`resource-${resource.name}`}
                    resource={resource}
                    genName={genName}
                    isCopied={isCopied}
                    isExpanded={isExpanded}
                    isTooLong={isTooLong}
                    isDarkMode={isDarkMode}
                    onCopy={(e) => copyToClipboard(genName, resource.name, e)}
                    onToggle={() => handleCardToggle(resource.name, isExpanded)}
                    selectedSubResource={selectedSubResource}
                    onSubResourceChange={(suffix) => handleSubResourceChange(resource.name, suffix)}
                />
            </div>
        );
    };

    if (filteredResources.length === 0) {
        return (
            <div className={`text-center py-16 ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>
                <p className="text-[14px]">No resources found matching your criteria.</p>
                <p className="text-[12px] mt-2">Try adjusting your search or category filter.</p>
            </div>
        );
    }

    return (
        <Grid
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={height}
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={width}
            className="mx-auto"
            style={{ outline: 'none' }}
        >
            {Cell}
        </Grid>
    );
}

export default memo(VirtualizedResourceGrid);
