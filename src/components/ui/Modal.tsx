import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  headerVariant?: 'default' | 'accent';
  size?: 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
  disableClose?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  headerVariant = 'default',
  size = 'md',
  footer,
  children,
  disableClose = false,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !disableClose) onClose();
      };
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, disableClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableClose) {
      onClose();
    }
  };

  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  const headerBgClass = headerVariant === 'accent' ? 'bg-kinetic-accent text-kinetic-bg' : 'bg-kinetic-muted/10';
  const closeBtnClass = headerVariant === 'accent' ? 'text-kinetic-bg hover:text-white' : 'text-kinetic-muted-fg hover:text-kinetic-accent';

  return (
    <div 
      className="fixed inset-0 bg-kinetic-bg/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-kinetic text-kinetic-fg"
      onClick={handleBackdropClick}
    >
      <div className={`bg-kinetic-bg w-full ${sizeClasses[size]} my-8 relative flex flex-col max-h-[90vh] ${className || 'border-2 border-kinetic-border'}`}>
        {title && (
          <div className={`border-b-2 border-kinetic-border p-6 flex justify-between items-center ${headerBgClass}`}>
            <h2 className="text-3xl font-bold tracking-tighter leading-none">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className={`${closeBtnClass} transition-colors text-2xl font-bold`}
            >
              ✕
            </button>
          </div>
        )}
        
        {title || footer ? (
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        ) : (
          children
        )}

        {footer && (
          <div className="p-6 bg-kinetic-muted/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
