import { useState } from 'react';
import Icon, { IconSpinner } from '../components/icons/Icon';
import PoliceIcon from '../components/icons/PoliceIcon';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useNotify } from '../context/NotifyContext';
import { Input, Button } from '../components/ui';

export default function LoginPage() {
  const { login, isLoading, isDevMode } = useAuth();
  const { customIconUrl } = useBranding();
  const { notify } = useNotify();
  const hasCustomIcon = Boolean(customIconUrl.trim());
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!badgeNumber.trim() || !password) {
      notify('Fehlende Daten eingeben', 'warning');
      return;
    }

    const result = await login(badgeNumber.trim(), password);
    if (!result.success) {
      notify(result.error ?? 'Anmeldung fehlgeschlagen.', 'error');
      return;
    }
    notify('Erfolgreich angemeldet.', 'success');
  };

  return (
    <div className="flex h-full min-h-0 items-center justify-center p-6">
      <div className="login-card w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className={`mb-4 flex items-center justify-center rounded-2xl ${
              hasCustomIcon
                ? 'h-20 w-20'
                : 'h-16 w-16 bg-accent/15 ring-2 ring-accent/30 shadow-lg shadow-accent/10'
            }`}
          >
            <PoliceIcon size={hasCustomIcon ? 72 : 40} prominent />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">POLIS</h1>
          <p className="mt-1 text-sm text-text-secondary">Polizei Information System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Dienstnummer"
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            placeholder="z.B. PD-1001"
            autoComplete="username"
          />

          <div className="relative">
            <Input
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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
