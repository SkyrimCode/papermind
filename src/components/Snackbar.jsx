import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const Snackbar = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`snackbar snackbar-${type}`}>
      <div className="snackbar-content">
        <CheckCircle size={20} />
        <span>{message}</span>
      </div>
      <button className="snackbar-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Snackbar;
