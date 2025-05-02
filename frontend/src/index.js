import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider,createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e486b", 
    },
    secondary: {
      main: "#F5F5F5",  
    },
  },
  text: {
    primary: "#374151",  
    secondary: "#6b7280",  
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h6: {
      color: "#374151",
    },
    body1: {
      color: "#374151", 
    },
  },
});



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

