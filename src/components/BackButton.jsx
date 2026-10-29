import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to = '/' }) {
  const nav = useNavigate();
  const go = () => {
    const i = window.history.state && window.history.state.idx;
    if (typeof i === 'number' && i > 0) nav(-1); else nav(to);
  };
  return <button type="button" className="back" onClick={go} aria-label="Go back"><ArrowLeft size={18} />Back</button>;
}
