import { useState } from 'react';
import LogoTest from '../assets/LogoTest.png'
export default function QuizifyLogo() {
  const [isHovered, setIsHovered] = useState(false);
  
  // Using your specific primary color #1976D2
  const primaryColor = "#1976D2";
  const primaryColorLight = "#2196F3";
  
  return (
    <div 
      className="flex items-center cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* <div className="relative">
        <div 
          className={`flex items-center justify-center w-12 h-12 rounded-lg text-white font-bold text-xl shadow-lg transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColorLight} 100%)`,
            boxShadow: isHovered ? `0 0 20px rgba(25, 118, 210, 0.6)` : '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          QF
        </div> */}
      {/* </div> */}
      <img src={LogoTest} height={60} width={60}/>
      <div className="flex flex-col">
        <span className="font-medium text-xl text-white">
          Quizify
        </span>
        <span className="text-xs text-blue-100 font-medium -mt-1">
          Quiz Smarter
        </span>
      </div>
    </div>
  );
}