import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const SignupPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'GOOGLE SIGN-IN FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('PASSWORDS DO NOT MATCH');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password, 'freelancer', displayName, paymentDetails);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'FAILED TO CREATE AN ACCOUNT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-kinetic-bg text-kinetic-fg font-kinetic">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-12">
            <h1 className="text-6xl font-bold tracking-tighter leading-none mb-2">REGISTER</h1>
            <p className="text-kinetic-muted-fg font-medium tracking-tight">CREATE YOUR FREELANCER ACCOUNT.</p>
          </div>

          <div className="border-2 border-kinetic-border p-6 relative">
            {/* Corner accent */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-kinetic-accent border-2 border-kinetic-border"></div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 font-bold p-3 mb-6 tracking-tighter text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="kinetic-btn w-full py-4 text-xl disabled:opacity-50"
            >
              CONTINUE WITH GOOGLE // G_AUTH
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t-2 border-kinetic-border" />
              <span className="text-kinetic-muted-fg font-bold text-xs tracking-tighter">// OR //</span>
              <div className="flex-1 border-t-2 border-kinetic-border" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  className="kinetic-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    className="kinetic-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">PASSWORD</label>
                  <input
                    type="password"
                    required
                    className="kinetic-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-muted-fg">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  required
                  className="kinetic-input"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <div className="flex flex-col pt-4">
                <label className="font-bold tracking-tighter mb-2 text-sm text-kinetic-accent">DEFAULT PAYMENT INSTRUCTIONS</label>
                <p className="text-kinetic-muted-fg text-xs mb-3 font-medium tracking-tight normal-case">These instructions will be shown to clients when they are ready to pay to unlock the original file. You can change this per-project.</p>
                <textarea
                  required
                  placeholder="e.g. Please transfer to Vodafone Cash 010... or Instapay link"
                  className="kinetic-input min-h-[120px] resize-none"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="kinetic-btn w-full py-4 text-xl mt-6 disabled:opacity-50"
              >
                CREATE ACCOUNT →
              </button>
            </form>
            <div className="mt-8 pt-6 border-t-2 border-kinetic-border text-center">
              <p className="font-medium tracking-tight text-sm text-kinetic-muted-fg">
                ALREADY HAVE AN ACCOUNT?{' '}
                <Link to="/login" className="text-kinetic-fg hover:text-kinetic-accent hover:underline font-bold transition-colors">
                  LOGIN
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
