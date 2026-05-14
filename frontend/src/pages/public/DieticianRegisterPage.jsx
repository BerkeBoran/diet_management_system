import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DieticianRegisterPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/register', { replace: true }); }, [navigate]);
  return null;
}
