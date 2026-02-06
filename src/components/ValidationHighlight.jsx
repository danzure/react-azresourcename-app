import { useMemo } from 'react';

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

    return (
        <span className="font-mono">
            {name.split('').map((char, i) => {
                const isValid = validator(char);
                return (
                    <span key={i} className={isValid ? '' : `${isDarkMode ? 'text-[#f1707b]' : 'text-[#a80000]'} font-bold underline decoration-wavy`} title={isValid ? '' : `Invalid: '${char}'`}>
                        {char}
                    </span>
                );
            })}
        </span>
    );
}
