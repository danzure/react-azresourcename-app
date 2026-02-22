import { useMemo } from 'react';
import PropTypes from 'prop-types';

export default function ValidationHighlight({ name, allowedCharsPattern, isDarkMode }) {
    const validator = useMemo(() => {
        if (!allowedCharsPattern) return () => true;
        const allowedParts = allowedCharsPattern.split(',').map(s => s.trim());
        let regexStr = '^[';
        allowedParts.forEach(p => {
            if (p === 'a-z') regexStr += 'a-z';
            else if (p === 'A-Z') regexStr += 'A-Z';
            else if (p === '0-9') regexStr += '0-9';
            else if (p === '-') regexStr += '\\-';
            else if (p === '_') regexStr += '_';
            else if (p === '.') regexStr += '\\.';
            else if (p === '()') regexStr += '\\(\\)';
        });
        regexStr += ']$';
        const regex = new RegExp(regexStr);
        return (char) => regex.test(char);
    }, [allowedCharsPattern]);

    // Group consecutive valid characters into single text nodes to reduce DOM elements
    const segments = useMemo(() => {
        const result = [];
        let validBuffer = '';
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            if (validator(char)) {
                validBuffer += char;
            } else {
                if (validBuffer) {
                    result.push({ type: 'valid', text: validBuffer });
                    validBuffer = '';
                }
                result.push({ type: 'invalid', text: char });
            }
        }
        if (validBuffer) {
            result.push({ type: 'valid', text: validBuffer });
        }
        return result;
    }, [name, validator]);

    return (
        <span className="font-mono">
            {segments.map((seg, i) =>
                seg.type === 'valid' ? (
                    seg.text
                ) : (
                    <span key={i} className={`${isDarkMode ? 'text-[#f1707b]' : 'text-[#a80000]'} font-bold underline decoration-wavy`} title={`Invalid: '${seg.text}'`}>
                        {seg.text}
                    </span>
                )
            )}
        </span>
    );
}

ValidationHighlight.propTypes = {
    name: PropTypes.string.isRequired,
    allowedCharsPattern: PropTypes.string,
    isDarkMode: PropTypes.bool.isRequired,
};
