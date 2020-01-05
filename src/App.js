import React from 'react';
import './App.css';

import Navbar from './components/Navbar'
import Infobox from './components/Infobox'
import Map from './components/Map'

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <Infobox />
      <Map />
    </div>
  );
}

export default App;
