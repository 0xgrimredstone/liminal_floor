import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {Home, CreateRoom, JoinRoom, DevNotes, Room, Levels} from './page';
import { OnboardModal } from './components';
import { GlobalContextProvider } from './context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GlobalContextProvider>
    <OnboardModal />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join-room" element={<JoinRoom />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/room/:name" element={<Room />} />
      <Route path="/levels" element={<Levels />} />
      <Route path="/dev" element={<DevNotes />} />
    </Routes>
  </GlobalContextProvider>
  </BrowserRouter>,
);
