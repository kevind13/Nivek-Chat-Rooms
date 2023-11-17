/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Parse from 'parse/dist/parse.min.js';
import { useNavigate } from 'react-router-dom';
import { errorMessages } from '../models/errors';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
 

  const navigate = useNavigate();

  const doUserLogIn = async () => {
    const usernameValue: string = username;
    const passwordValue: string = password;
    try {
      const loggedInUser: Parse.User = await Parse.User.logIn(usernameValue, passwordValue);

      const currentUser: Parse.User | undefined = await Parse.User.current();
      setUsername('');
      setPassword('');
      if (loggedInUser === currentUser) navigate('/');
    } catch (error: any) {
      const errorMessage = error.message || errorMessages[error.code] || `Error! ${error.message}`;
      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className='container mx-auto py-8 px-4'>
        <h2 className='text-2xl font-bold mb-4'>User Login</h2>
        <hr className='mb-4' />
        <div className='space-y-4'>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder='Username'
            className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500'
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='Password'
            type='password'
            className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='mt-6 gap-3 flex flex-col'>
          <button
            onClick={() => doUserLogIn()}
            className='w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg focus:outline-none hover:bg-blue-600'>
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className='w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg focus:outline-none hover:bg-blue-600'>
            Sign up
          </button>
        </div>
        { !!error && <span className='text-red-500'>{error}</span>}
      </div>
    </div>
  );
};

export default Login;
