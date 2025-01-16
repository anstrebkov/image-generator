import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Header />
      <ImageGenerator />
      <ToastContainer />
    </div>
  );
}

export default App;