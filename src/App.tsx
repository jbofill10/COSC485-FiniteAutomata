import * as React from 'react';
import * as ReactDOM from 'react-dom';
import process from 'process';

class App extends React.Component{
    onComponentDidMount(){

    }

    render(){
        return(
            <div>{String(process.env.file1)}
            </div>
        )
    }
}


ReactDOM.render(<App></App>, document.getElementById('root'));