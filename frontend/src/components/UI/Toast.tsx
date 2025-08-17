import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastVariants = cva(
  'flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border transition-all duration-300',
  {
    variants: {
      variant: {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  className,
  variant,
  title,
  message,
  duration = 5000,
  onClose,
  show = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!show && !isVisible) return null;

  return (
    <div
      className={cn(
        toastVariants({ variant, className }),
        'transform transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      {...props}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium">{title}</p>
        )}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export { Toast, toastVariants };
