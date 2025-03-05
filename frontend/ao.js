const io = require('socket.io-client');

const socket = io('wss://nongao.lol-th-no1.com', {
  path: '/socket.io/',
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  socket.emit('joinRoom', 1);
  socket.emit('newPrompt', { userId: 1, prompt: 'Hello from script!' });
});

socket.on('chatHistory', (history) => {
  console.log('Chat History:', history);
});

socket.on('onLog', (logData) => {
  console.log('Log:', logData);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});