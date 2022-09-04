import React, { FC, useEffect } from 'react';

const style = `
  html, body {
    height: 100%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background-color: #383b43;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  a {
    color: white;
  }`;

const Logout: FC = () => {
  useEffect(() => {
    fetch('/api/logout', { method: 'POST' });
  }, []);

  return (
    <>
      <style>{style}</style>
      <h1>Bye then</h1>

      <a href="/">Regret</a>
    </>
  );
};

export default Logout;
