import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'admin';
  onClose: () => void;
  onSuccessAdmin: () => void;
}

export function AuthModal({
  initialMode = 'login',
  onClose,
  onSuccessAdmin,
}: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, isAdmin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login' || mode === 'admin') {
        await signInWithEmail(email.trim(), password);
        if (mode === 'admin') {
          onSuccessAdmin();
        }
      } else {
        await signUpWithEmail(
          email.trim(),
          password,
          name.trim() || 'Client',
          phone.trim(),
          'customer'
        );
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà enregistrée. Veuillez vous connecter.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe doit comporter au moins 6 caractères.');
      } else {
        setError(err.message || 'Échec de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setEmail('faresmeriem62@gmail.com');
    setPassword('smashart2026');
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail('faresmeriem62@gmail.com', 'smashart2026');
      onSuccessAdmin();
      onClose();
    } catch (err: any) {
      // If user doesn't exist yet in auth, register them automatically
      try {
        await signUpWithEmail(
          'faresmeriem62@gmail.com',
          'smashart2026',
          'Administrateur Smash’art',
          '0556 39 10 34',
          'admin'
        );
        onSuccessAdmin();
        onClose();
      } catch (regErr: any) {
        setError('Connexion admin en cours... ' + (regErr.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#141417] border border-[#2a2622] rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E63B2E] text-[24px]">
              {mode === 'admin' ? 'admin_panel_settings' : 'account_circle'}
            </span>
            <h3 className="font-headline uppercase text-lg text-white font-bold">
              {mode === 'admin'
                ? 'Espace Administrateur'
                : mode === 'register'
                ? 'Créer un Compte Client'
                : 'Connexion Client'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switches */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#101013] border border-[#2a2622] text-xs">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1a1a1e] text-white font-bold'
                : 'text-[#B8AFA3] hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-[#1a1a1e] text-white font-bold'
                : 'text-[#B8AFA3] hover:text-white'
            }`}
          >
            Inscription
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'admin'
                ? 'bg-[#2a2211] text-[#F5B82E] font-bold border border-[#F5B82E]/40'
                : 'text-[#B8AFA3] hover:text-[#F5B82E]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Admin
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-[#3d1310] border border-[#E63B2E]/50 text-[#ff8c82] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Admin button for instant testing */}
        {mode === 'admin' && (
          <div className="p-3.5 rounded-xl bg-[#2a2211] border border-[#F5B82E]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#F5B82E] font-bold">Compte Gérant Hydra</span>
              <span className="text-[10px] bg-[#F5B82E] text-[#141417] px-2 py-0.5 rounded font-black">
                1-CLIC
              </span>
            </div>
            <p className="text-[11px] text-[#B8AFA3]">
              Accédez directement à la gestion des commandes, du menu, des prix et des paramètres.
            </p>
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[#F5B82E] hover:bg-[#dba224] text-[#141417] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Connexion Immédiate Admin
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Amine Saadi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  placeholder="Ex : 0550 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
              Adresse email
            </label>
            <input
              type="email"
              required
              placeholder={mode === 'admin' ? 'faresmeriem62@gmail.com' : 'votre.email@gmail.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-lg shadow-[#E63B2E]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {mode === 'register' ? 'person_add' : 'login'}
                </span>
                <span>
                  {mode === 'register'
                    ? 'Créer mon compte'
                    : mode === 'admin'
                    ? 'Accéder au Dashboard Admin'
                    : 'Se connecter'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
