import React from 'react';
//  import logo from './logo.svg';
import './App.css';
import './css/mazu.css';
import Mazu from './Mazu.js';


function App() {

    return (

        <div className="App">
            <header className="App-header">
                <h3>Mazu</h3>
                <Mazu className={"mazu-main"}/>
            </header>
        </div>

    );
}

export default App;
