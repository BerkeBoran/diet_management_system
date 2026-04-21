import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password, role);
      toast.success('Giriş başarılı!');
      navigate(data.role === 'Client' ? '/dashboard' : '/dietician/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center w-full px-6 py-8">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tighter font-headline">NutriConnect</Link>
        <div className="flex items-center gap-2 text-primary font-semibold font-headline">
          <span className="material-symbols-outlined">help_outline</span>
        </div>
      </header>

      {/* Organic Backdrop Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-64 h-64 rounded-full bg-tertiary/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <main className="w-full max-w-[480px] mt-12 mb-12 animate-slide-up">
        <div className="glass-card rounded-3xl p-8 md:p-12 ambient-shadow ghost-border">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Hoş Geldiniz</h1>
            <p className="text-on-surface-variant">Sağlıklı yaşam için hassas beslenme.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <div className="bg-surface-container-high p-1.5 rounded-2xl flex items-center">
              <button
                type="button"
                onClick={() => setRole('Client')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all duration-200
                  ${role === 'Client'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
              >
                Danışan
              </button>
              <button
                type="button"
                onClick={() => setRole('Dietician')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all duration-200
                  ${role === 'Dietician'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
              >
                Diyetisyen
              </button>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant px-1">
                  E-posta Adresi
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">mail</span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ornek@nutriconnect.com"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant">
                    Şifre
                  </label>
                  <a className="text-xs font-semibold text-primary hover:underline" href="#">
                    Unuttunuz mu?
                  </a>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">lock</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline hover:text-primary transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-primary text-white font-headline font-bold text-lg rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-10 text-center text-sm text-on-surface-variant">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Hesap oluşturun
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full py-12 flex flex-col md:flex-row justify-between items-center px-8 gap-6 bg-surface-container-low/30">
        <div className="font-headline text-xs uppercase tracking-widest text-outline">
          © 2024 NUTRICONNECT. HASSAS BESLENME YÖNETİMİ.
        </div>
        <div className="flex gap-6">
          <a className="font-headline text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors" href="#">Gizlilik Politikası</a>
          <a className="font-headline text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors" href="#">Destek</a>
        </div>
      </footer>
    </div>
  );
}
