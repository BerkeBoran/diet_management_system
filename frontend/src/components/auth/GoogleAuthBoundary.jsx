import { GoogleOAuthProvider } from '@react-oauth/google';
import { Outlet } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function GoogleAuthBoundary() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Outlet />
    </GoogleOAuthProvider>
  );
}
