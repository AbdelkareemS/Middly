import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFreelancerProjects, updateProjectStatus } from '../services/projectService';
import type { Project } from '../types/types';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const FreelancerDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [receiptProject, setReceiptProject] = useState<Project | null>(null);
  const [finishProjectId, setFinishProjectId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const fetchProjects = async () => {
    if (!userProfile?.uid) return;
    try {
      setLoading(true);
      const data = await getFreelancerProjects(userProfile.uid);
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error('ERROR // FAILED TO FETCH PROJECTS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userProfile?.uid]);

  const activeCount = projects.filter(p => p.status !== 'completed').length;
  const canCreate = activeCount < 10;

  const handleApproveReceipt = async (projectId: string) => {
    try {
      await updateProjectStatus(projectId, 'approved');
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('ERROR // FAILED TO APPROVE RECEIPT');
    }
  };

  const confirmFinishProject = async () => {
    if (!finishProjectId) return;
    try {
      setIsFinishing(true);
      await updateProjectStatus(finishProjectId, 'completed');
      fetchProjects();
      toast.success('SUCCESS // PROJECT ARCHIVED');
    } catch (err) {
      console.error(err);
      toast.error('ERROR // FAILED TO FINISH PROJECT');
    } finally {
      setIsFinishing(false);
      setFinishProjectId(null);
    }
  };

  const handleFinishProject = (projectId: string) => {
    setFinishProjectId(projectId);
  };

  return (
    <div className="min-h-screen bg-kinetic-bg text-kinetic-fg font-kinetic flex flex-col">
      
      {/* Brutalist Navbar for Dashboard */}
      <nav className="w-full border-b-2 border-kinetic-border bg-kinetic-bg py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-kinetic-fg">
          MIDDLY<span className="text-kinetic-accent">/</span>DASHBOARD
        </Link>
        <div className="flex gap-4">
          <div className="hidden md:flex items-center text-sm font-medium tracking-tight text-kinetic-muted-fg mr-4">
            USER: {userProfile?.displayName}
          </div>
          <button
            onClick={logout}
            className="kinetic-btn py-2 px-6 text-sm"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-screen-2xl mx-auto w-full space-y-12">
        
        {/* Top Stats Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-kinetic-border pb-8 relative">
          
          {/* Massive Background Number */}
          <div className="absolute top-0 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 -translate-y-4 text-[clamp(6rem,15vw,12rem)] font-bold text-kinetic-muted leading-[0.7] select-none pointer-events-none -z-10 text-right md:text-center">
            {activeCount.toString().padStart(2, '0')}
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-2">
              PROJECTS<span className="text-kinetic-accent">.</span>
            </h1>
            <p className="text-kinetic-muted-fg font-bold tracking-widest text-lg">
              ACTIVE LIMIT: {activeCount} / 10
            </p>
          </div>
          
          <div className="mt-8 md:mt-0 w-full md:w-auto z-10">
            <button
              disabled={!canCreate}
              onClick={() => setShowCreateModal(true)}
              className="kinetic-btn w-full md:w-auto px-10 py-5 text-xl disabled:opacity-50 !bg-kinetic-fg !text-kinetic-bg hover:!bg-kinetic-accent hover:!border-kinetic-accent transition-colors"
            >
              + NEW PROJECT
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[2px] bg-kinetic-border border-2 border-kinetic-border">
          {loading ? (
            <div className="col-span-full py-20 text-center bg-kinetic-bg">
              <span className="text-4xl font-bold tracking-tighter animate-pulse">LOADING_</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-kinetic-bg">
              <p className="text-3xl font-bold tracking-tighter text-kinetic-muted-fg">NO ACTIVE PROJECTS.</p>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.projectId}
                project={project}
                onRefresh={fetchProjects}
                onReviewReceipt={setReceiptProject}
                onFinishProject={handleFinishProject}
              />
            ))
          )}
        </div>

      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}

      {receiptProject && (
        <ReceiptModal
          project={receiptProject}
          onClose={() => setReceiptProject(null)}
          onApprove={handleApproveReceipt}
        />
      )}

      <ConfirmDialog
        isOpen={!!finishProjectId}
        onClose={() => setFinishProjectId(null)}
        onConfirm={confirmFinishProject}
        title="ARCHIVE PROJECT?"
        message="THIS WILL COMPLETE THE PROJECT AND FREE UP A SLOT IN YOUR ACTIVE LIMIT. THIS ACTION CANNOT BE UNDONE."
        variant="success"
        loading={isFinishing}
      />

    </div>
  );
};
