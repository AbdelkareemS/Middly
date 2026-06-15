import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'default';
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  variant = 'default',
  loading = false,
  children,
}) => {
  let titleColor = 'text-kinetic-fg';
  let confirmBtnClass = '!bg-kinetic-fg !text-kinetic-bg !border-kinetic-fg hover:opacity-80';
  let borderClass = 'border-kinetic-border';

  if (variant === 'danger') {
    titleColor = 'text-red-500';
    confirmBtnClass = '!bg-red-500 !text-white !border-red-500 hover:opacity-80';
    borderClass = 'border-red-500';
  } else if (variant === 'success') {
    titleColor = 'text-[#00FF00]';
    confirmBtnClass = '!bg-[#00FF00] !text-[#09090B] !border-[#00FF00] hover:opacity-80';
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      className={`kinetic-card text-center p-8 md:p-12 border-4 ${borderClass} shadow-2xl`}
      disableClose={loading}
    >
      <h2 className={`text-4xl font-bold tracking-tighter mb-4 ${titleColor}`}>{title}</h2>
      {children}
      {message && (
        <p className="text-kinetic-muted-fg font-medium tracking-tight mb-8">
          {message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="kinetic-btn flex-1 py-4 text-xl border-kinetic-border text-kinetic-fg hover:bg-kinetic-muted/20 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`kinetic-btn flex-1 py-4 text-xl ${confirmBtnClass} disabled:opacity-50`}
        >
          {loading ? 'PROCESSING...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
