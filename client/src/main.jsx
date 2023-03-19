import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {Home, CreateRoom, DevNotes, Levels, Test} from './page';
import { OnboardModal } from './components';
import { GlobalContextProvider } from './context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GlobalContextProvider>
    <OnboardModal />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/room/:name" element={<Test />} />
      <Route path="/levels" element={<Levels />} />
      <Route path="/dev" element={<DevNotes />} />
    </Routes>
  </GlobalContextProvider>
  </BrowserRouter>,
);
