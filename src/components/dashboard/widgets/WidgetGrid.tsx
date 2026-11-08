import React from 'react';

interface WidgetGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  children,
  columns = 4,
  className = ''
}) => {
  const colClassMap = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
  };

  return (
    <div className={`grid gap-4 ${colClassMap[columns]} ${className}`}>
      {children}
    </div>
  );
};
