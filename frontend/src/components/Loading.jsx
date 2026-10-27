// Simple "loading" text shown while we wait for the backend.
function Loading({ text = 'Loading...' }) {
  return (
    <p className="loading" role="status">
      {text}
    </p>
  );
}

export default Loading;
