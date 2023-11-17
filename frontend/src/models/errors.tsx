import Parse from 'parse/dist/parse.min.js';

export const errorMessages: { [key: number]: string } = {
    [Parse.Error.INVALID_LOGIN_PARAMS]: 'Invalid username or password',
    [Parse.Error.USERNAME_MISSING]: 'Username is required',
    [Parse.Error.PASSWORD_MISSING]: 'Password is required',
    [Parse.Error.OBJECT_NOT_FOUND]: 'Object not found',
    [Parse.Error.EMAIL_MISSING]: 'Email is missing',
    [Parse.Error.EMAIL_NOT_FOUND]: 'Email not found',
    [Parse.Error.EMAIL_TAKEN]: 'Email has already been taken',
    [Parse.Error.INVALID_EMAIL_ADDRESS]: 'Email address is invalid',
    [Parse.Error.INVALID_SESSION_TOKEN]: 'Invalid session token',
  };

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;