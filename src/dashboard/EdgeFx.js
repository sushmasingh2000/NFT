import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'goToLogin') {
        navigate('/');
      } else if (event.data === 'goToregister') {
        navigate('/register');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <iframe
      src="/staticfiles/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        overflow: 'hidden',
      }}
      title="Static HTML Page"
    />

  );
}

export default Main;
