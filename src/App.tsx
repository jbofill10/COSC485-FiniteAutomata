import * as React from 'react';
import * as ReactDOM from 'react-dom';
import process from 'process';
import fs from 'fs'
import { Diagram } from "./components/index";

function App() {
        return(
            <div>
                <Diagram/>
            </div>
        )
    }

ReactDOM.render(<App/>, document.getElementById('root'));