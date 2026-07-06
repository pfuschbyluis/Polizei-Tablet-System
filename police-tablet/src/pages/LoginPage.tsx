import { useState } from 'react';
import Icon, { IconSpinner } from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';

export default function LoginPage() {
  const { login, loginError, isLoading, isDevMode } = useAuth();
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeNumber.trim() || !password) return;
    await login(badgeNumber.trim(), password);
  };

  return (
    <div className="flex h-full min-h-0 items-center justify-center p-6">
      <div className="login-card w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/25">
            <Icon name="shield" size={28} className="text-accent-light" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">POLIS</h1>
          <p className="mt-1 text-sm text-text-secondary">Polizei Information System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Dienstnummer"
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            placeholder="z.B. PD-1001"
            autoComplete="username"
            required
          />

          <div className="relative">
            <Input
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>

          {loginError && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {loginError}
            </div>
          )}

          <Button type="submit" className="w-full !py-2.5" disabled={isLoading}>
            {isLoading ? (
              <>
                <IconSpinner size={16} /> Anmelden...
              </>
            ) : (
              'Anmelden'
            )}
          </Button>
        </form>

        {isDevMode && (
          <p className="mt-6 text-center text-xs text-text-muted">
            Demo: PD-1001 / admin123
          </p>
        )}
      </div>
    </div>
  );
}
