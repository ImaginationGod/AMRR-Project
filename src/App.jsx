import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Add from './pages/Add';
import View from './pages/View';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/view" element={<View />} />
      </Routes>
    </Router>
  )
}

export default App;