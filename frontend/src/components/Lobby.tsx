/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from 'parse/dist/parse.min.js';
import io from 'socket.io-client';
import { Rooms } from '../models/rooms';

const Lobby = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<Parse.User>();
  const [showModal, setShowModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>();
  const [infoModal, setInfoModal] = useState<string>();
  const [newRoomName, setNewRoomName] = useState<string>();
  const [showInputRoom, setShowInputRoom] = useState<boolean>(false);

  useEffect(() => {
    async function checkUser() {
      const currentUser = await Parse.User.current();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setCurrentUser(currentUser);
      setNewNickname(currentUser.get('nickname'));
    }
    checkUser();
  }, [navigate]);

  const handleChangeUsername = async () => {
    if (currentUser && newNickname.trim() !== '') {
      currentUser.set('nickname', newNickname.trim());
      try {
        await currentUser.save();
        setCurrentUser(currentUser);
        setShowModal(false);
      } catch (error) {
        setInfoModal('Error while updating username');
      }
    }
  };

  const handleModal = (value: boolean) => {
    setShowModal(value);
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_SERVER || 'http://localhost:3001');
    setSocket(socket);

    socket.emit('getRooms', (availableRooms: Rooms[]) => {
      setRooms(availableRooms);
    });

    socket.on('updateRooms', (availableRooms: Rooms[]) => {
      setRooms(availableRooms);
    });

    socket.on('message', (message: string, nickname: string) => {
      const formattedMessage = `${nickname}: ${message}`;
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoinRoom = useCallback(
    (room: string) => {
      if (socket) {
        socket.emit('joinRoom', room, (success: boolean) => {
          if (success) {
            setSelectedRoom(room);
          } else {
            setInfoModal('Room is full or does not exist');
          }
        });
      }
    },
    [socket]
  );

  useEffect(() => {
    if (selectedRoom && socket) {
      handleJoinRoom(selectedRoom);
      setMessages([]);
    }
  }, [handleJoinRoom, selectedRoom, socket]);

  const handleCreateRoom = useCallback(() => {
    if (rooms.find((room) => room.name === newRoomName)) {
      setInfoModal('Room already exists.');
      return;
    }
    if (socket && newRoomName) {
      socket.emit('createRoom', newRoomName);
      setNewRoomName(undefined);
      setShowInputRoom(false);
    }
  }, [newRoomName, rooms, socket]);

  const handleSendMessage = () => {
    if (selectedRoom && newMessage && socket) {
      socket.emit('sendMessage', {
        room: selectedRoom,
        message: newMessage,
        nickname: newNickname,
      });
      setNewMessage('');
    }
  };

  return (
    <div>
      {currentUser && (
        <div className='bg-gray-200 p-4'>
          <h2 className='text-xl font-bold mb-2'>Welcome, {currentUser.get('username')}</h2>
          <p className='text-lg mb-1'>Nickname: {currentUser.get('nickname')}</p>
          <button
            onClick={() => handleModal(true)}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 focus:outline-none'>
            Change Username
          </button>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='bg-black bg-opacity-50 absolute inset-0'></div>
          <div className='bg-white p-4 rounded-lg relative z-10 flex flex-col'>
            <span
              className='text-red-500 cursor-pointer absolute top-2 right-2 text-2xl'
              onClick={() => handleModal(false)}>
              &times;
            </span>
            <span>Choose your new nickname</span>
            <div className='flex flex-row gap-1 mt-5'>
              <input
                type='text'
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className='border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500'
              />
              <button
                onClick={handleChangeUsername}
                className='bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600'>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      {!!infoModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='bg-black bg-opacity-50 absolute inset-0'></div>
          <div className='bg-white p-4 rounded-lg relative z-10 flex flex-col'>
            <span
              className='text-red-500 cursor-pointer absolute top-2 right-2 text-2xl'
              onClick={() => setInfoModal(undefined)}>
              &times;
            </span>
            <span className='p-4'>{infoModal}</span>
          </div>
        </div>
      )}
      <div className='flex flex-col sm:flex-row sm:h-[20rem] h-auto'>
        <div className='w-full sm:w-1/4 h-full p-4 bg-gray-100 border-r overflow-y-auto '>
          <h2 className='mb-4 text-lg font-bold'>Rooms</h2>
          <button
            onClick={() => setShowInputRoom(true)}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4'>
            Create Room
          </button>
          <div className='flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-hidden'>
          {showInputRoom && (
              <div className='flex items-center border border-gray-300 rounded pl-2 mr-3 sm:mt-3 sm:mr-0'>
                <input
                  type='text'
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className='border-none sm:w-full focus:outline-none w-32'
                  placeholder='Room'
                />
                <button
                  onClick={handleCreateRoom}
                  className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'>
                  OK
                </button>
              </div>
            )}
            <ul className='flex flex-row sm:flex-col gap-3'>
              {rooms.map((room, index) => (
                <li
                  key={`${room.name}-${index}`}
                  onClick={
                    room.users < room.maxUsers
                      ? () => setSelectedRoom(room.name)
                      : () => setInfoModal('Max users in this room.')
                  }
                  className={`cursor-pointer hover:bg-blue-200 p-2 rounded ${
                    room.users < room.maxUsers ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                  {room.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {selectedRoom && (
          <div className='w-full sm:w-3/4 h-full p-4'>
            <h2 className='mb-4 text-lg font-bold'>Chat room {selectedRoom}</h2>
            <div className='border border-gray-300 p-2 sm:h-[70%] overflow-y-auto mb-4 h-[20rem]'>
              {messages.map((message, index) => (
                <div key={index} className='message mb-2 p-2 bg-gray-200 rounded'>
                  {message}
                </div>
              ))}
            </div>
            <div className='flex'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className='border border-gray-300 rounded-l px-4 py-2 w-full focus:outline-none'
                placeholder='Type a message...'
              />
              <button
                onClick={handleSendMessage}
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r'>
                Send
              </button>
            </div>
          </div>
        )}
        {!selectedRoom && (
          <div className='w-3/4 h-full p-4'>
            <h2 className='mb-4 text-lg font-bold'>Join or create any room</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
