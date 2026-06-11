import React, { useState } from 'react';
import { generateUploadUrl, createProject } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import type { FileType } from '../types/types';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const { userProfile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [fileType, setFileType] = useState<FileType>('image');
  const [paymentInstructions, setPaymentInstructions] = useState(userProfile?.paymentDetails || '');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('PLEASE SELECT A FILE.');
    
    try {
      setLoading(true);
      setError('');

      const uploadRes = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      });

      if (file.size > uploadRes.maxFileSizeBytes) {
        throw new Error(`FILE TOO LARGE. MAX SIZE IS ${Math.round(uploadRes.maxFileSizeBytes / 1024 / 1024)}MB.`);
      }

      const s3Res = await fetch(uploadRes.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!s3Res.ok) throw new Error('S3 UPLOAD FAILED.');

      await createProject({
        title,
        price: Number(price),
        fileType,
        fileS3Key: uploadRes.fileS3Key,
        clientEmail,
        paymentInstructions,
      });

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'CREATION FAILED.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-kinetic-bg/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-kinetic text-kinetic-fg">
      <div className="border-2 border-kinetic-border bg-kinetic-bg w-full max-w-2xl my-8 relative">
        
        {/* Header */}
        <div className="border-b-2 border-kinetic-border p-6 flex justify-between items-center bg-kinetic-muted/10">
          <h2 className="text-3xl font-bold tracking-tighter leading-none">
            NEW PROJECT<span className="text-kinetic-accent">_</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-kinetic-muted-fg hover:text-kinetic-accent transition-colors text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500 text-red-500 font-bold p-3 mb-6 tracking-tighter text-sm uppercase">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">TITLE</label>
              <input required type="text" className="kinetic-input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">PRICE ($)</label>
                <input required type="number" min="1" step="0.01" className="kinetic-input text-kinetic-accent" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">FILE TYPE</label>
                <select className="kinetic-input" value={fileType} onChange={e => setFileType(e.target.value as FileType)}>
                  <option value="image">IMAGE</option>
                  <option value="video">VIDEO</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">EXCEL</option>
                  <option value="word">WORD</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">CLIENT EMAIL (OPTIONAL)</label>
              <input type="email" className="kinetic-input" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">PAYMENT INSTRUCTIONS</label>
              <textarea required className="kinetic-input min-h-[80px] resize-none" value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} />
            </div>

            {/* Brutalist File Input */}
            <div className="flex flex-col border-2 border-kinetic-border p-6 bg-kinetic-muted/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-kinetic-border flex items-center justify-center text-kinetic-bg text-xs group-hover:bg-kinetic-accent transition-colors">
                ↓
              </div>
              <label className="font-bold tracking-tighter mb-4 text-sm text-kinetic-accent">UPLOAD FILE (S3 SECURE)</label>
              <input 
                required 
                type="file" 
                className="w-full text-sm text-kinetic-muted-fg
                  file:mr-4 file:py-3 file:px-6 
                  file:border-2 file:border-kinetic-border
                  file:bg-kinetic-bg file:text-kinetic-fg
                  file:font-bold file:uppercase file:tracking-tighter
                  hover:file:bg-kinetic-accent hover:file:border-kinetic-accent hover:file:text-kinetic-bg
                  file:transition-colors file:cursor-pointer
                  cursor-pointer" 
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="kinetic-btn w-full py-5 text-2xl mt-8 disabled:opacity-50 !bg-kinetic-fg !text-kinetic-bg hover:!bg-kinetic-accent hover:!border-kinetic-accent transition-colors"
            >
              {loading ? 'UPLOADING...' : 'CREATE PROJECT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
