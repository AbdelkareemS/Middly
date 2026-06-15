import React from 'react';
import type { Project } from '../types/types';
import { Modal } from './ui/Modal';

interface ReceiptModalProps {
  project: Project;
  onClose: () => void;
  onApprove: (projectId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ project, onClose, onApprove }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="REVIEW RECEIPT"
      headerVariant="accent"
      size="xl"
      footer={
        <button
          onClick={() => {
            onApprove(project.projectId);
            onClose();
          }}
          className="kinetic-btn w-full py-5 text-2xl !border-[#00FF00] !text-[#00FF00] hover:!bg-[#00FF00] hover:!text-kinetic-bg"
        >
          APPROVE & UNLOCK DOWNLOAD →
        </button>
      }
    >
        <div className="bg-[#000000] min-h-[400px] flex items-center justify-center relative group">
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
    </Modal>
  );
};
