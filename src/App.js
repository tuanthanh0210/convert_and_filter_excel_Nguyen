import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ScrollButton from './components/ScrollTop';
import ExcelReader from './read-file/ExcelReader';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ExcelReader />
        <ScrollButton />
      </div>
    );
  }
}

export default App;
