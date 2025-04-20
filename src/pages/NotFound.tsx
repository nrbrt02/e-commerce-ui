import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ComingSoon: React.FC = () => {
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  
  // Animation states
  const [animate, setAnimate] = useState(false);
  
  // Initialize countdown to 30 days from now
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Trigger entry animation after component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);
  
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className={`absolute top-24 left-1/4 w-64 h-64 bg-sky-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${animate ? 'scale-100' : 'scale-0'} transition-transform duration-1000`}></div>
        <div className={`absolute top-36 right-1/4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${animate ? 'scale-100' : 'scale-0'} transition-transform duration-1000 delay-300`}></div>
        <div className={`absolute bottom-24 right-1/3 w-60 h-60 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 ${animate ? 'scale-100' : 'scale-0'} transition-transform duration-1000 delay-500`}></div>
      </div>
      
      <div className={`max-w-2xl w-full text-center transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Logo placeholder */}
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center mb-6 shadow-lg transform transition-transform hover:rotate-3 hover:scale-105 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-12 backdrop-blur-sm bg-opacity-90 transform transition-all duration-500 hover:shadow-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-400 tracking-tight mb-2">Coming Soon</h1>
          <p className="text-lg sm:text-xl font-medium text-gray-800 mb-1">Fast Shopping is getting a makeover</p>
          <p className="text-base text-gray-600 mb-8">We're working hard to bring you an amazing shopping experience.</p>
          
          {/* Countdown timer */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto mb-10">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="bg-sky-50 rounded-lg p-2 sm:p-4 transform transition-transform hover:scale-105 duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-sky-700">{value}</div>
                <div className="text-xs sm:text-sm uppercase text-sky-500">{label}</div>
              </div>
            ))}
          </div>
          
          {/* Notification form */}
          
        </div>
        
        {/* Footer navigation */}
        <div className="mt-8 mb-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transform transition-transform hover:scale-105 duration-300"
          >
            <svg
              className="mr-2 -ml-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;