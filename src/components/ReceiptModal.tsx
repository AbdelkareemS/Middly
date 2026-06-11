import React from 'react';
import type { Project } from '../types/types';

interface ReceiptModalProps {
  project: Project;
  onClose: () => void;
  onApprove: (projectId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ project, onClose, onApprove }) => {
  return (
    <div className="fixed inset-0 bg-kinetic-bg/95 flex items-center justify-center p-4 z-50 font-kinetic text-kinetic-fg">
      <div className="border-2 border-kinetic-border bg-kinetic-bg w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        
        {/* Header */}
        <div className="border-b-2 border-kinetic-border p-6 flex justify-between items-center bg-kinetic-accent text-kinetic-bg">
          <h2 className="text-3xl font-bold tracking-tighter leading-none">
            REVIEW RECEIPT
          </h2>
          <button 
            onClick={onClose}
            className="text-kinetic-bg hover:text-white transition-colors text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#000000] border-b-2 border-kinetic-border min-h-[400px] flex items-center justify-center relative group">
          {project.receiptImageUrl ? (
            <img 
              src={project.receiptImageUrl} 
              alt="Payment Receipt" 
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : (
            <p className="font-bold tracking-tighter text-kinetic-muted-fg text-2xl">NO RECEIPT DATA.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-kinetic-muted/10">
          <button
            onClick={() => {
              onApprove(project.projectId);
              onClose();
            }}
            className="kinetic-btn w-full py-5 text-2xl !border-[#00FF00] !text-[#00FF00] hover:!bg-[#00FF00] hover:!text-kinetic-bg"
          >
            APPROVE & UNLOCK DOWNLOAD →
          </button>
        </div>

      </div>
    </div>
  );
};
