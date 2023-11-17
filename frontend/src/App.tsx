/* eslint-disable @typescript-eslint/no-explicit-any */
import { Route, Routes, useNavigate } from 'react-router-dom';
import Lobby from './components/Lobby';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Parse from 'parse/dist/parse.min.js';
import Register from './components/Register';

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID, import.meta.env.VITE_PARSE_JS_ID);
Parse.serverURL = import.meta.env.VITE_PARSE_HOST_URL;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const currentUser = await Parse.User.current();
      setIsLoggedIn(!!currentUser);
      if (currentUser) navigate('/');
    }
    checkUser();
  }, [navigate]);

  const doUserLogOut = async () => {
    try {
      await Parse.User.logOut();
      navigate('/login');
    } catch (error: any) {
      setError(`Error! ${error.message}`);
    }
  };

  return (
    <>
      <div className='flex items-center justify-between bg-blue-500 p-6'>
        <div className='flex items-center'>
          <p className='text-white text-lg font-bold'>Nivek Chat APP</p>
        </div>
        {isLoggedIn && (
          <button className='text-white' onClick={doUserLogOut}>
            Logout
          </button>
        )}
      </div>
      {!!error && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='bg-black bg-opacity-50 absolute inset-0'></div>
          <div className='bg-white p-4 rounded-lg relative z-10 flex flex-col'>
            <span
              className='text-red-500 cursor-pointer absolute top-2 right-2 text-2xl'
              onClick={() => setError(undefined)}>
              &times;
            </span>
            <span className='p-4'>{error}</span>
          </div>
        </div>
      )}

      <Routes>
        <Route index element={<Lobby />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
