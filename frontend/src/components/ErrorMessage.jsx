// Red box that shows an error. Shows nothing when there is no message.
function ErrorMessage({ message, onRetry }) {
  if (!message) {
    return null;
  }
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
