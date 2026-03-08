import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext/UserContext';
import { logout as logoutService } from '../../services/oauthService';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

function UserProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, clearUser } = useUser();
  const { profile, loading, error } = state;

  const handleLogout = () => {
    logoutService();
    clearUser();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <p className="m-0 text-gray-400">{t('userProfile.loading')}</p>
      </div>
    );
  }

  if (error || !profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {profile.images && profile.images.length > 0 && (
        <img
          src={profile.images[0].url}
          alt={profile.display_name}
          className="w-10 h-10 rounded-full"
        />
      )}
      <div className="hidden sm:block">
        <p className="m-0 font-semibold text-sm text-white">{profile.display_name}</p>
        <p className="m-0 text-xs text-gray-400">{profile.email}</p>
      </div>
      <Button
        variant="ghost"
        className={cn(
          'text-gray-300',
          'hover:text-white',
          'hover:bg-gray-800',
          'dark:hover:bg-gray-900',
          'dark:text-gray-300'
        )}
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default UserProfile;
