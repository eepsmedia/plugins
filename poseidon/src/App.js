import React from 'react';
//  import logo from './logo.svg';
import './App.css';
import './css/poseidon.css';
import Poseidon from './Poseidon.js';


function App() {

    return (

        <div className="App">
            <header className="App-header">
                <h3>Poseidon</h3>
                <Poseidon className={"poseidon-main"}/>
            </header>
        </div>

    );
}

export default App;
