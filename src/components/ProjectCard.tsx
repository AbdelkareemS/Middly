import React from 'react';
import type { Project } from '../types/types';
import { deleteProject } from '../services/projectService';
import toast from 'react-hot-toast';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ProjectCardProps {
  project: Project;
  onRefresh: () => void;
  onReviewReceipt: (project: Project) => void;
  onFinishProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onRefresh,
  onReviewReceipt,
  onFinishProject,
}) => {
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/view/${project.projectId}?token=${project.accessToken}`;
    navigator.clipboard.writeText(url);
    toast.success('SUCCESS // CLIENT LINK COPIED');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(project.projectId);
      onRefresh();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error('ERROR // FAILED TO DELETE');
      setDeleting(false);
    }
  };

  let statusText = '';
  let statusColor = 'text-kinetic-muted-fg';
  let borderHighlight = 'border-kinetic-border';
  
  switch (project.status) {
    case 'pending_preview': 
      statusText = 'WAITING FOR CLIENT'; 
      break;
    case 'receipt_uploaded': 
      statusText = 'RECEIPT UPLOADED'; 
      statusColor = 'text-kinetic-accent';
      borderHighlight = 'border-kinetic-accent';
      break;
    case 'approved': 
      statusText = 'APPROVED / UNLOCKED'; 
      statusColor = 'text-[#00FF00]';
      break;
    case 'completed': 
      statusText = 'COMPLETED'; 
      break;
  }

  const isCompleted = project.status === 'completed';

  return (
    <>
    <div className={`kinetic-card flex flex-col transition-all ${isCompleted ? 'opacity-50 grayscale' : `hover:border-kinetic-fg ${borderHighlight}`}`}>
      
      {/* Brutalist Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-kinetic-border relative">
        <div className="pr-4">
          <h3 className="text-2xl font-bold tracking-tighter leading-tight break-words max-w-full">
            {project.title}
          </h3>
          <p className="text-sm font-bold mt-1 text-kinetic-muted-fg tracking-widest">{project.fileType}</p>
        </div>
        <div className="text-3xl font-black text-kinetic-accent tracking-tighter shrink-0">
          ${project.price}
        </div>
      </div>

      <div className="mb-8">
        <p className={`text-xs font-bold tracking-widest ${statusColor}`}>
          STATUS // {statusText}
        </p>
      </div>

      <div className="mt-auto grid gap-3">
        {!isCompleted && (
          <button
            onClick={copyLink}
            className="kinetic-btn w-full py-3 text-sm flex items-center justify-between px-4 group"
          >
            <span>COPY GUEST LINK</span>
            <span className="text-kinetic-muted-fg group-hover:text-kinetic-bg transition-colors">⎘</span>
          </button>
        )}

        {project.status === 'receipt_uploaded' && (
          <button
            onClick={() => onReviewReceipt(project)}
            className="kinetic-btn w-full py-3 text-sm !border-kinetic-accent !text-kinetic-accent hover:!bg-kinetic-accent hover:!text-kinetic-bg"
          >
            REVIEW RECEIPT
          </button>
        )}

        {project.status === 'approved' && (
          <button
            onClick={() => onFinishProject(project.projectId)}
            className="kinetic-btn w-full py-3 text-sm !border-[#00FF00] !text-[#00FF00] hover:!bg-[#00FF00] hover:!text-kinetic-bg"
          >
            FINISH PROJECT
          </button>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          className="kinetic-btn w-full py-3 text-sm border-red-500/50 text-red-500/80 hover:!bg-red-500 hover:!text-white hover:!border-red-500 disabled:opacity-50"
        >
          {deleting ? 'DELETING...' : 'DELETE PROJECT'}
        </button>
      </div>
    </div>

    <ConfirmDialog
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="DELETE PROJECT?"
      message="THIS WILL PERMANENTLY DELETE THE PROJECT AND ALL ASSOCIATED FILES. THIS ACTION CANNOT BE UNDONE."
      confirmLabel="DELETE"
      variant="danger"
      loading={deleting}
    >
      <p className="text-kinetic-muted-fg font-medium tracking-tight mb-2">
        <span className="font-bold text-kinetic-fg">{project.title}</span>
      </p>
    </ConfirmDialog>
    </>
  );
};
