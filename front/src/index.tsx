import React from 'react';
import ReactDOM from 'react-dom/client';

import App from "./App";
// import WalletLogin from "./components/WalletLogin";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
        {/* <WalletLogin /> */}
        <App />
  </React.StrictMode>
);


reportWebVitals();