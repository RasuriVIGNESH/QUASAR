import React from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter} from 'react-router-dom';import {MotionConfig} from 'framer-motion';
import App from './App';import {Store} from './ui';import {AuthProvider} from './auth';import './index.css';
try{const t=localStorage.getItem('qt');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches)}catch{}
createRoot(document.getElementById('root')).render(<BrowserRouter><MotionConfig reducedMotion="user"><AuthProvider><Store><App/></Store></AuthProvider></MotionConfig></BrowserRouter>);
