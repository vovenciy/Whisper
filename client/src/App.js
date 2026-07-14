import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Main from './pages/Main';
import { MyTokenContext } from './context/MyToken';
import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SocketContext } from './context/Socket';
import { MyNameContext } from './context/MyName';
import { useSessionStorage } from './hooks/useSessionStorage';
import { RequestsContext } from './context/Requests';
import { CurrentContactContext } from './context/CurrentContact';
function App() {
  const [Socket, setSocket] = useSessionStorage('socket')
  const [MyToken, setMyToken] = useSessionStorage('UserToken')
  const [MyName, setMyName] = useSessionStorage('me')
  const [Requests, setRequests] = useSessionStorage("AllMyRequests", [])
  return (
        <RequestsContext.Provider value = {{Requests, setRequests}}>
          <MyNameContext.Provider value={{MyName, setMyName}}>
            <SocketContext.Provider value = {{Socket, setSocket}}>
              <MyTokenContext.Provider value={{MyToken, setMyToken}}>
                <div>
                  
                  <Routes>
                    <Route path="/" element={<Navigate to="/Login" replace />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Registration" element={<Registration />} />
                    <Route path="/Main" element={<Main />} />
                    <Route path="*" element={<h2>Страница не найдена</h2>} />
                  </Routes>
                </div>
              </MyTokenContext.Provider>
            </SocketContext.Provider>
          </MyNameContext.Provider>
        </RequestsContext.Provider>
  );
}

export default App;