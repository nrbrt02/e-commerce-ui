import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const HeroBanner = ({ slides = [
    {
        title: "SMART WEARABLE",
        subtitle: "Best Deal Online on smart watches",
        discount: "UP to 80% OFF",
        image: "https://plus.unsplash.com/premium_photo-1710708048482-2e07e963bc65?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U01BUlQlMjBXRUFSQUJMRXxlbnwwfHwwfHx8MA%3D%3D",
        ctaText: "Shop Now",
        ctaLink: "/category/wearables"
    },
    {
        title: "PREMIUM SMARTPHONES",
        subtitle: "Latest Models at Unbeatable Prices",
        discount: "UP to 50% OFF",
        image: "https://images.unsplash.com/photo-1672413514634-4781b15fd89e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnRwaG9uZXN8ZW58MHx8MHx8fDA%3D",
        ctaText: "Explore Now",
        ctaLink: "/category/smartphones"
    },
    {
        title: "GAMING LAPTOPS",
        subtitle: "Ultimate Performance for Gamers",
        discount: "From Rwf1599900 Only",
        image: "https://images.unsplash.com/photo-1589913649361-56d3f8762bc7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z2FtbWluZyUyMGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D",
        ctaText: "View Collection",
        ctaLink: "/category/laptops"
    },
    {
        title: "WIRELESS EARBUDS",
        subtitle: "Premium Sound Quality",
        discount: "Starting at Rwf59000",
        image: "https://images.unsplash.com/photo-1667178173387-7e0cb51c0b4f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8V0lSRUxFU1MlMjBFQVJCVURTfGVufDB8fDB8fHww",
        ctaText: "Buy Now",
        ctaLink: "/category/audio"
    },
    {
        title: "SMART HOME DEVICES",
        subtitle: "Transform Your Living Space",
        discount: "UP to 40% OFF",
        image: "https://images.unsplash.com/photo-1730967844913-29eb5cae5f34?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U01BUlQlMjBIT01FJTIwREVWSUNFU3xlbnwwfHwwfHx8MA%3D%3D",
        ctaText: "Discover More",
        ctaLink: "/category/smart-home"
    }
] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const totalSlides = slides.length;
    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                nextSlide();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isAnimating]);
    const nextSlide = () => {
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 500);
    };
    const prevSlide = () => {
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 500);
    };
    const goToSlide = (index) => {
        if (currentSlide !== index) {
            setIsAnimating(true);
            setCurrentSlide(index);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };
    const currentSlideData = slides[currentSlide];
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8", children: _jsxs("div", { className: "relative bg-gradient-to-r from-sky-700 to-sky-900 rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row", children: [_jsx("button", { onClick: prevSlide, className: "absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500", "aria-label": "Previous slide", disabled: isAnimating, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-sky-700", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: nextSlide, className: "absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500", "aria-label": "Next slide", disabled: isAnimating, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-sky-700", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }), _jsx("div", { className: "w-full md:w-2/5 h-56 md:h-auto bg-sky-800/40 overflow-hidden", children: _jsx("img", { src: currentSlideData.image, alt: currentSlideData.title, className: "h-full w-full object-cover transition-all duration-500" }) }), _jsxs("div", { className: "w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center", children: [_jsxs("div", { className: `text-white transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`, children: [_jsx("p", { className: "text-sm md:text-base font-medium mb-1 text-sky-200", children: currentSlideData.subtitle }), _jsx("h2", { className: "text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5", children: currentSlideData.title }), _jsx("p", { className: "text-lg md:text-xl lg:text-2xl font-bold text-sky-100 mb-4 md:mb-6", children: currentSlideData.discount }), _jsxs("a", { href: currentSlideData.ctaLink, className: "inline-flex items-center px-6 py-2.5 bg-white text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-800", children: [currentSlideData.ctaText, _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 ml-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })] })] }), _jsx("div", { className: "mt-6 md:mt-8 flex space-x-2", children: slides.map((_, i) => (_jsx("button", { onClick: () => goToSlide(i), className: `h-2 rounded-full transition-all duration-300 focus:outline-none ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-sky-400/50 hover:bg-sky-300'}`, "aria-label": `Go to slide ${i + 1}`, disabled: isAnimating }, i))) })] })] }) }));
};
export default HeroBanner;
