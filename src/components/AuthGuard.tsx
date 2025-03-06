import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

interface Props {
  children: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  return token ? <>{children}</> : null;
};

export default AuthGuard;
