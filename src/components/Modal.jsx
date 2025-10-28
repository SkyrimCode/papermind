import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
    animation: 'fadeIn 0.2s ease-out'
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    animation: 'slideUp 0.3s ease-out'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    color: '#9ca3af',
    borderRadius: '6px',
    transition: 'all 0.2s'
  };

  const headerStyle = {
    marginBottom: '1rem'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1f2937'
  };

  const bodyStyle = {
    marginBottom: '2rem'
  };

  const messageStyle = {
    margin: 0,
    color: '#6b7280',
    fontSize: '1rem',
    lineHeight: '1.6'
  };

  const footerStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  };

  const buttonBaseStyle = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const dangerButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#667eea',
    color: 'white'
  };

  const confirmButtonStyle = type === 'danger' ? dangerButtonStyle : primaryButtonStyle;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
        </div>
        
        <div style={bodyStyle}>
          <p style={messageStyle}>{message}</p>
        </div>
        
        <div style={footerStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>
            {cancelText}
          </button>
          <button 
            style={confirmButtonStyle}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
