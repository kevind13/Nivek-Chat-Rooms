/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';
import Parse from 'parse/dist/parse.min.js';
import { useNavigate } from 'react-router-dom';
import { errorMessages, passwordRegex } from '../models/errors';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>();

  const navigate = useNavigate();

  const errors = useCallback(() => {
    if (password != confirmPassword) {
      return 'Passwords does not match';
    }
    if (!passwordRegex.test(password)) {
      return 'Password must contain at least one letter, one digit, and be at least 8 characters long';
    }
    return;
  }, [confirmPassword, password]);

  const doUserRegistration = async () => {
    setError('');
    const usernameValue: string = username;
    const passwordValue: string = password;

    const anyError = errors();
    if (anyError) {
      setError(anyError);
      return;
    }
    try {
      const createdUser: Parse.User = await Parse.User.signUp(usernameValue, passwordValue);

      createdUser.set('nickname', 'NewNickname');
      await createdUser.save();

      const currentUser: Parse.User | undefined = await Parse.User.current();
      setUsername('');
      setPassword('');
      if (createdUser === currentUser) navigate('/');
    } catch (error: any) {
      const errorMessage = error.message || errorMessages[error.code] || `Error! ${error.message}`;
      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className='container mx-auto py-8 px-4'>
        <h2 className='text-2xl font-bold mb-4'>User Registration</h2>
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
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder='Confirm Password'
            type='password'
            className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='mt-6'>
          <button
            onClick={() => doUserRegistration()}
            className='w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg focus:outline-none hover:bg-blue-600'>
            Sign Up
          </button>
        </div>
        {!!error && <span className='text-red-500'>{error}</span>}
      </div>
    </div>
  );
};

export default Register;
