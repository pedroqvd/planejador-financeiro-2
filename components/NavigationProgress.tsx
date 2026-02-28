'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        // Start progress
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(0);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);

        // Simulate progress
        let p = 0;
        timerRef.current = window.setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p >= 90) p = 90;
            setProgress(p);
        }, 100);

        // Complete after short delay (page is already loaded in SPA)
        const done = setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setProgress(100);
            setTimeout(() => setVisible(false), 200);
        }, 300);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            clearTimeout(done);
        };
    }, [pathname]);

    if (!visible) return null;

    return (
        <div id="nprogress">
            <div
                className="bar"
                style={{
                    width: `${progress}%`,
                    transition: progress === 100 ? 'width 0.1s ease, opacity 0.2s ease' : 'width 0.2s ease',
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    );
}
