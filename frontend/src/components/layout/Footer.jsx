import { Link } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container flex justify-between items-center md-flex-col gap-4" style={{ flexWrap: 'wrap' }}>
        <div className="flex items-center gap-2">
          <span style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 700,
            fontSize: '1.8rem',
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
          }}>LIFEETICS</span>
          <span className="text-muted text-sm">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-muted text-sm" style={{ transition: 'color var(--transition)' }}>Gizlilik Politikası</a>
          <a href="#" className="text-muted text-sm" style={{ transition: 'color var(--transition)' }}>Kullanım Koşulları</a>
          <a href="#" className="text-muted text-sm" style={{ transition: 'color var(--transition)' }}>İletişim</a>
        </div>
      </div>
    </footer>
  );
}
