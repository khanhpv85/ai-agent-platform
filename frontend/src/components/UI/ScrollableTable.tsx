import React from 'react';

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ 
  children, 
  className = "", 
  maxHeight = "max-h-96 sm:max-h-[500px] lg:max-h-[600px]" 
}) => {
  return (
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
      {/* Table Header - Fixed with Horizontal Scroll */}
      <div className="overflow-x-auto border-b border-gray-200">
        {children}
      </div>

      {/* Scrollable Table Body with Both Horizontal and Vertical Scroll */}
      <div className="relative">
        <div className={`overflow-auto ${maxHeight} table-scrollbar shadow-inner`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export { ScrollableTable };
