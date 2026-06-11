import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getGuestPreview, getGuestDownload, submitReceipt } from '../services/projectService';
import type { GuestPreviewResult } from '../services/projectService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export const ClientGuestView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewData, setPreviewData] = useState<GuestPreviewResult | null>(null);

  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId || !token) {
      setError(true);
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const data = await getGuestPreview(projectId, token);
        setPreviewData(data);
        setRealtimeStatus(data.status);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    init();

    const unsub = onSnapshot(doc(db, 'projects', projectId), (doc) => {
      if (doc.exists()) {
        const p = doc.data();
        if (p.accessToken === token) {
          setRealtimeStatus(p.status);
        }
      }
    });

    return () => unsub();
  }, [projectId, token]);

  const handleDownload = async () => {
    if (!projectId || !token) return;
    try {
      const res = await getGuestDownload(projectId, token);
      window.open(res.downloadUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('ERROR // FAILED TO GENERATE LINK.');
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !projectId || !token) return;
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        try {
          await submitReceipt(projectId, token, base64Image);
          toast.success('SUCCESS // PROOF SUBMITTED. AWAITING APPROVAL.');
        } catch (err) {
          console.error(err);
          toast.error('ERROR // UPLOAD FAILED.');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error('ERROR // FILE READ ERROR.');
        setUploading(false);
      };
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kinetic-bg text-kinetic-fg font-kinetic">
        <div className="text-[clamp(3rem,8vw,8rem)] font-bold tracking-tighter animate-pulse text-kinetic-muted">LOADING_</div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kinetic-bg text-kinetic-fg font-kinetic">
        <div className="text-center">
          <div className="text-kinetic-accent text-[8rem] font-bold leading-none">403</div>
          <h1 className="text-5xl font-bold tracking-tighter">ACCESS DENIED</h1>
        </div>
      </div>
    );
  }

  const isApproved = realtimeStatus === 'approved' || realtimeStatus === 'completed';
  const showUpload = !isApproved && realtimeStatus !== 'receipt_uploaded';
  const isPendingApproval = realtimeStatus === 'receipt_uploaded';

  return (
    <div className="min-h-screen bg-kinetic-bg text-kinetic-fg font-kinetic flex flex-col">
      
      {/* Header */}
      <header className="border-b-2 border-kinetic-border p-6 md:p-12 relative overflow-hidden">
        {/* Massive Background Number */}
        <div className="absolute top-0 right-10 text-[clamp(8rem,20vw,20rem)] font-bold text-kinetic-muted leading-[0.7] select-none pointer-events-none -z-10 text-right opacity-30">
          SECURE
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 max-w-screen-2xl mx-auto w-full z-10">
          <div className="flex-1 max-w-4xl">
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold tracking-tighter leading-[0.85] break-words text-kinetic-fg uppercase">
              {previewData.title}
            </h1>
            <p className="text-kinetic-accent font-bold tracking-widest mt-4">PREVIEW MODE // {previewData.fileType}</p>
          </div>
          <div className="text-[clamp(4rem,10vw,8rem)] font-black text-kinetic-accent leading-none tracking-tighter shrink-0">
            ${previewData.price}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 md:p-12 space-y-12">
        
        {/* Secure Preview Area */}
        <section className="border-2 border-kinetic-border bg-[#000000] relative min-h-[500px] flex items-center justify-center overflow-hidden">
          {previewData.fileType === 'image' && (
            <div className="relative inline-block h-full w-full flex items-center justify-center">
              <img 
                src={previewData.previewUrl} 
                alt="Preview" 
                className="max-h-[70vh] object-contain pointer-events-none"
                onContextMenu={e => e.preventDefault()}
              />
              <div className="absolute inset-0 watermark-overlay pointer-events-none opacity-80 mix-blend-screen"></div>
            </div>
          )}

          {previewData.fileType === 'video' && (
            <video 
              src={previewData.previewUrl} 
              controls 
              controlsList="nodownload" 
              disablePictureInPicture
              onContextMenu={e => e.preventDefault()}
              className="w-full max-h-[70vh]"
            />
          )}

          {(previewData.fileType === 'pdf' || previewData.fileType === 'excel' || previewData.fileType === 'word') && (
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewData.previewUrl)}&embedded=true`} 
              className="w-full h-[70vh] border-0"
              title="Document Preview"
            />
          )}
        </section>

        {/* Interaction Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-kinetic-border border-2 border-kinetic-border">
          
          {/* Instructions */}
          <div className="kinetic-card border-0 bg-kinetic-muted/10 min-h-[300px] flex flex-col">
            <h3 className="text-3xl font-bold tracking-tighter mb-6 text-kinetic-accent border-b-2 border-kinetic-border pb-4">
              PAYMENT INFO
            </h3>
            <p className="whitespace-pre-wrap font-medium text-lg leading-relaxed text-kinetic-fg">
              {previewData.paymentInstructions || "NO INSTRUCTIONS PROVIDED."}
            </p>
          </div>

          {/* Gateway */}
          <div className="kinetic-card border-0 bg-kinetic-bg min-h-[300px] flex flex-col justify-center items-center text-center p-8 lg:p-12">
            
            {isApproved ? (
              <div className="w-full bg-kinetic-accent p-8 text-kinetic-bg flex flex-col items-center border-4 border-kinetic-bg">
                <div className="text-7xl mb-4 font-bold tracking-tighter">UNLOCKED</div>
                <button 
                  onClick={handleDownload}
                  className="w-full border-4 border-kinetic-bg bg-kinetic-bg text-kinetic-fg hover:bg-transparent hover:text-kinetic-bg transition-colors py-6 text-3xl font-bold tracking-tighter uppercase"
                >
                  DOWNLOAD ORIGINAL ↓
                </button>
              </div>
            ) : isPendingApproval ? (
              <div className="w-full border-2 border-kinetic-accent p-8">
                <div className="text-6xl mb-4 animate-spin text-kinetic-accent mx-auto w-16 h-16 border-4 border-t-kinetic-accent border-r-kinetic-accent border-b-transparent border-l-transparent rounded-full"></div>
                <h3 className="text-3xl font-bold tracking-tighter text-kinetic-accent mb-2">AWAITING APPROVAL</h3>
                <p className="font-bold text-kinetic-muted-fg tracking-tight">FREELANCER IS VERIFYING RECEIPT...</p>
              </div>
            ) : uploading ? (
              <div className="w-full border-2 border-kinetic-accent p-8 text-center">
                <div className="text-6xl mb-4 animate-spin text-kinetic-accent mx-auto w-16 h-16 border-4 border-t-kinetic-accent border-r-kinetic-accent border-b-transparent border-l-transparent rounded-full"></div>
                <h3 className="text-3xl font-bold tracking-tighter text-kinetic-accent mb-2">UPLOADING...</h3>
                <p className="font-bold text-kinetic-muted-fg tracking-tight">SECURING RECEIPT DATA</p>
              </div>
            ) : showUpload ? (
              <div className="w-full text-left">
                <h3 className="text-3xl font-bold tracking-tighter mb-2">SUBMIT PROOF</h3>
                <p className="text-kinetic-muted-fg font-medium tracking-tight mb-6">
                  PAID ${previewData.price}? UPLOAD SCREENSHOT.
                </p>
                <div className="border-2 border-kinetic-border p-4 bg-kinetic-muted/10 hover:border-kinetic-accent transition-colors group relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="w-full font-bold text-sm file:mr-4 file:py-3 file:px-6 file:border-2 file:border-kinetic-border file:bg-kinetic-bg file:text-kinetic-fg file:font-bold file:uppercase file:tracking-tighter hover:file:bg-kinetic-accent hover:file:border-kinetic-accent hover:file:text-kinetic-bg file:transition-colors cursor-pointer text-kinetic-muted-fg group-hover:text-kinetic-fg transition-colors"
                    onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </div>
                <button 
                  onClick={handleUploadReceipt}
                  disabled={!receiptFile || uploading}
                  className="kinetic-btn w-full py-5 text-2xl mt-6 disabled:opacity-50 !border-kinetic-accent hover:!bg-kinetic-accent"
                >
                  {uploading ? 'UPLOADING...' : 'SUBMIT RECEIPT →'}
                </button>
              </div>
            ) : null}

          </div>
        </div>

      </main>
    </div>
  );
};
