import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from '../../App';

AppRegistry.registerComponent('ProjectACK', () => App);

const root = document.getElementById('root');
if (!root) throw new Error('Project ACK web root was not found');

createRoot(root).render(<App />);
