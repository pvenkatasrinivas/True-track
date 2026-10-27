// Pages pass a one-time success message through navigation, like:
//   navigate('/tasks', { state: { message: 'Task deleted successfully.' } });
// This hook reads that message and then clears it from the browser history,
// so it does not show again if the user refreshes the page.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useFlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Same page, but without the message in its state.
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  return [message, setMessage];
}
