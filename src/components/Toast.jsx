import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, isVisible, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-[#323130] text-white rounded shadow-depth animate-slide-up z-50">
            <CheckCircle className="w-5 h-5 text-[#57a300]" />
            <span className="text-[14px] font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
