import { useState, useEffect } from 'react';
export const useScreenWidth = () => {
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [isTablet, setIsTablet] = useState(typeof window !== 'undefined'
        ? window.innerWidth >= 768 && window.innerWidth < 1024
        : false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
            setIsDesktop(width >= 1024);
        };
        // Initial call
        handleResize();
        // Add event listener
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return {
        screenWidth,
        isMobile,
        isTablet,
        isDesktop
    };
};
export default useScreenWidth;
