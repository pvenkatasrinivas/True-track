// Green box that hides itself after a few seconds.
import { useEffect } from 'react';

function SuccessMessage({ message, onClose, hideAfterMs = 4000 }) {
  useEffect(() => {
    if (!message || !onClose) {
      return;
    }
    const timer = setTimeout(onClose, hideAfterMs);
    return () => clearTimeout(timer); // stop the timer if the message changes or the page closes
  }, [message, onClose, hideAfterMs]);

  if (!message) {
    return null;
  }
  return (
    <div className="alert alert-success" role="status">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" aria-label="Close message" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
}

export default SuccessMessage;
