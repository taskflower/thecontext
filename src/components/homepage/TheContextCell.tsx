const TheContextCell = ({ className = '', inverted = true }) => {
    // Define colors - background and text will be opposite
    const colors = {
      background: inverted ? '#FFFFFF' : '#000000',
      text: inverted ? '#000000' : '#FFFFFF'  // Text color is opposite of background
    };
  
    return (
      <div className={`inline-block ${className}`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 120 140"
          className="w-full h-full"
        >
          {/* Cell background */}
          <rect 
            x="10" 
            y="10" 
            width="100" 
            height="120" 
            rx="8" 
            fill={colors.background}
            stroke={colors.text}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Atomic number (top left) */}
          <text 
            x="20" 
            y="35" 
            fill={colors.text}
            className="font-sans text-[21px]"
          >
            Tc
          </text>
          
          {/* Element symbol (center) */}
          <text 
            x="60" 
            y="80" 
            fill={colors.text}
            className="font-sans text-4xl font-bold"
            textAnchor="middle"
          >
            Ctx
          </text>
          
          {/* Element name (bottom) */}
          <text 
            x="60" 
            y="115" 
            fill={colors.text}
            className="font-sans text-md"
            textAnchor="middle"
          >
            TheContext
          </text>
        </svg>
      </div>
    );
  };
  
  export default TheContextCell;