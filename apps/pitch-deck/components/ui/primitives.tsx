/**
 * UI Primitives - Reusable components for consistent design
 * Based on modern design system principles
 */

import React from 'react';

// ==========================================
// CARD COMPONENT
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'flat';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white rounded-xl shadow-lg p-8 transition-all duration-300',
    hover: 'bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
    flat: 'bg-white rounded-xl border border-gray-200 p-8 transition-all duration-300',
  };

  return (
    <div
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// HEADING COMPONENT
// ==========================================
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  children,
  className = '',
  gradient = false,
  ...props
}) => {
  const sizes = {
    1: 'text-5xl md:text-6xl font-black tracking-tight',
    2: 'text-4xl md:text-5xl font-bold tracking-tight',
    3: 'text-3xl md:text-4xl font-bold',
    4: 'text-2xl md:text-3xl font-semibold',
  };

  const gradientClass = gradient
    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'
    : '';

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return React.createElement(
    Tag,
    {
      className: `${sizes[level]} ${gradientClass} ${className}`,
      ...props,
    },
    children
  );
};

// ==========================================
// METRIC COMPONENT
// ==========================================
interface MetricProps {
  value: string | number;
  label: string;
  trend?: number;
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  value,
  label,
  trend,
  className = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-5xl md:text-6xl font-black text-gray-900 mb-2 tracking-tight">
        {value}
      </div>
      {trend !== undefined && (
        <div className={`text-sm font-medium mb-1 flex items-center justify-center gap-1 ${
          trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-gray-500'
        }`}>
          {trend > 0 && '↑'}
          {trend < 0 && '↓'}
          {trend !== 0 && `${Math.abs(trend)}%`}
        </div>
      )}
      <div className="text-lg text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
};

// ==========================================
// BADGE COMPONENT
// ==========================================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// ICON WRAPPER COMPONENT
// ==========================================
interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'gray';
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const variants = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
    secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
    gray: 'bg-gray-100',
  };

  return (
    <div
      className={`${sizes[size]} ${variants[variant]} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// GRADIENT BACKGROUND COMPONENT
// ==========================================
interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-primary-500 to-secondary-500',
    secondary: 'bg-gradient-to-br from-secondary-500 to-primary-500',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800',
    light: 'bg-gradient-to-br from-gray-50 to-gray-100',
  };

  return (
    <div
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// SECTION COMPONENT
// ==========================================
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <section
      className={`relative ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};

// ==========================================
// CONTAINER COMPONENT
// ==========================================
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`${sizes[size]} mx-auto px-6 md:px-12 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// GRID COMPONENT
// ==========================================
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 2,
  gap = 'md',
  className = '',
  ...props
}) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6 md:gap-8',
    lg: 'gap-8 md:gap-12',
  };

  return (
    <div
      className={`grid ${colsClass[cols]} ${gapClass[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
