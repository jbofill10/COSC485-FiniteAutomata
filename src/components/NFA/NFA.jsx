import React from 'react';
import { Network } from 'react-vis-network';
import { generateStates } from '../Diagram/States';
import { generateTransitions } from '../Diagram/Transitions';
import 'dotenv/config'
import fs from 'fs';


export default class NFA extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            width: null,
            height: null,
            states: null,
            alphabet: null,
            startingState: null,
            finalStates: null,
            transitionFunctions: null,
            strings: null,
            ran: false,
            startColor: null,
            optimizedTransitions: null
        };
    }
    // Calls functions to scale HTML canvas to window size when the component is loaded
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions.bind(this));
    }
    // Same as componentDidMount(), but when the component unmounts
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions.bind(this));
    }
    // If information in the props of other components changes, it re-renders the component 
    componentDidUpdate(){
        if (this.props.states !== this.state.states){
            this.setState({states: this.props.states});
        }
        if (this.props.alphabet !== this.state.alphabet){
            this.setState({alphabet: this.props.alphabet});
        }
        if (this.props.startingState !== this.state.startingState){
            this.setState({startingState: this.props.startingState});
        }
        if (this.props.finalStates !== this.state.finalStates){
            this.setState({finalStates: this.props.finalStates});
        }
        if (this.props.transitionFunctions !== this.state.transitionFunctions){
            this.setState({transitionFunctions: this.props.transitionFunctions});
        }

        if(this.state.height !== undefined && 
            this.state.width !== undefined && 
            this.props.states !== undefined && 
            this.props.startingState !== undefined 
            && this.props.finalStates !== undefined 
            && this.props.transitionFunctions !== undefined && !this.state.ran){

                this.setState({startColor:(this.props.finalStates.includes(this.props.startingState) ? '#af8baf' :'#75daad')})
                
                this.computeStringsOnNFA();
                this.optimizeTransitions();
        }
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });

    }
    render(){
        return(
            this.renderGraph()
        );
    }

    renderGraph = () => {

        const graphOptions = {
            height:String(this.state.height),
            width:String(this.state.width),
            edges:{
                color: {
                    color: '#8cacd0',
                    highlight: '#8cacd0',
                    hover: '#8cacd0',
                    inherit:false
                }
            }
        }

        if(this.state.height !== null && this.state.width !== null && this.state.states !== null && this.state.startingState !== null 
            && this.state.finalStates !== null && this.state.transitionFunctions && this.state.optimizedTransitions !== null){
            
            return(
                <div className='AllStateContainers' style={{
                    'paddingLeft': '5px'
                }}>
                    <div className='Type' style={{
                        'color': '#494368',
                        'fontSize': '20px'
                    }}>
                        NFA
                    </div>

                    <div className='StartingStateContainer' style={{
                        'display':'flex',
                    }}>

                    <div>Starting State:</div>
                    <div className='StartingStateText' style={{
                        'color': this.state.startColor,
                    }}>&nbsp; {this.props.startingState}</div>

                </div>


                <div className='OtherStateContainer' style={{
                        'display':'flex'
                    }}>

                    <div>Other States:</div>

                    {this.props.states.map((state, index) => {
                        if (this.state.finalStates.includes(state)) return;
                    return(
                        <div key={index} className='StartingStateText' style={{
                            'color': '#8cacd0' 
                            }}>&nbsp; {state} </div>

                    )
                        })}
                    
                    
                    </div>


                    <div className='FinalStateContainer' style={{
                        'display':'flex'
                    }}>

                    <div>Final States:</div>

                    {this.props.finalStates.map((state, index) => {
                        if (this.state.startingState === state){
                            return(
                                <div key={index} className='StartingStateText' style={{
                                    'color': this.state.startColor
                                    }}>&nbsp; {state} </div>
        
                            )
                        }
                    return(
                        <div key={index} className='FinalStateText' style={{
                            'color': '#f34573' 
                            }}>&nbsp; {state} </div>

                    )
                        })}
                    
                    </div>

                    <button style={{
                        marginTop: '5px',
                        width: '90px'
                    }} onClick={this.onClick}>
                        Click if Diagram Looks Ugly
                    </button>
            
                <Network options={graphOptions}>
                    {/* Building States for Graph */}
                    {generateStates(this.props.states, this.props.startingState, this.props.finalStates)}
                    
                    {generateTransitions(this.state.optimizedTransitions)}

                </Network>
                </div>
            );
        }else{
                return(
                    <div>Loading...</div>
                );
            }
    }
    /**
     * Runs strings through NFA model to see if they're accepted
     */
    computeStringsOnNFA = () => {
        this.setState({ran:true})
        var strings = fs.readFileSync(String(process.env.REACT_APP_file2)).toString("utf-8").split("\n").filter(e => e.length > 1);

        // String hashmap to contain whether its true or false
        var stringAcceptance = {};

        // Set all strings in the hashmap with a value that is false
        // If the string is accepted in the machine, it is set to true.
        strings.forEach(string => {
            
            string = string.trim()

            stringAcceptance[string] = false;
        })

        strings.forEach(string => {
            string = string.trim();

            // Queue styled data structure to maintain what current states the machine is at
            // The transitionChar is just a place filler 
            var currentStates  = [{state: this.props.startingState, transitionChar: 'e', string: string}];
            
            while(currentStates.length > 0){

                // Every time we exhaust the queue (currentStates), we are keeping track of the new
                // transitions that can be checked and is added
                // into the previous queue after exhausted 
                var transitionsFound = [];
                
                for(var stateEntry of currentStates){

                    var currentChar = stateEntry['string'].slice(0,1)
                    var currentString = stateEntry['string']
                    
                    var currentState = stateEntry['state']

                    currentStates.shift();

                    // Does current state contain a transition? If not, next character
                    if (this.props.transitionFunctions.hasOwnProperty(currentState)){
                        this.props.transitionFunctions[currentState].forEach(transition => {
                            
                            // Technically object.entries returns a 2D array, but it will always be one key value pairing
                            // So I can always use [0][0] and [0][1] to get the values I want 100% of the time 
                            var transitionState = Object.entries(transition)[0][0];
                            var transitionChar = Object.entries(transition)[0][1];
                            
                            // If transition function uses current character
                            if (transitionChar === currentChar){
                               
                                transitionsFound.push({
                                    state: transitionState, 
                                    transitionChar: transitionChar, 
                                    string: currentString.slice(1)
                                });

                            // If the transition is epsilon, then we don't use a character 
                            }else if(transitionChar === 'e'){
                                transitionsFound.push({
                                    state: transitionState, 
                                    transitionChar: transitionChar, 
                                    string: currentString
                                });
                            }  
                        });
                    }
                }

                // The next possible transitions to example are put in the currentStates queue
                // After we have iterated through the currentStates array
                transitionsFound.forEach(element => {
                    currentStates.push(element)
                })

                    if (stateEntry['string'] === ""){
                            
                            if (this.props.finalStates.includes(stateEntry['state'])){

                                stringAcceptance[string] = true;
                            }                        
                    }

                }
        });

        // Output to file

        var output = "";
        for(var entry of Object.entries(stringAcceptance)){
                
            if(entry[1]){
                output += `${entry[0].trim()} is accepted.\n\n`;

            }else{
                output +=`${entry[0].trim()} is rejected.\n\n`;
            }
            
            fs.writeFileSync(String(process.env.REACT_APP_file3), output);
        }
    }

    onClick = () => {
        window.location.reload()
    }

    /**
        * Due to the graph library not supporting several self-referencing loops
        * I made a custom function to pair these self referencing transitions
        * to be under the same string. i.e a,b instead of two transitions a and b
     */
    optimizeTransitions = () => {
        
        var optimizedTransitions = {}

        Object.entries(this.props.transitionFunctions).map(([k,v]) => {
            
            var transitions = [];

            for(var transition of v){
                
                var entry = Object.entries(transition);
                var transitionState = entry[0][0];
                var transitionChar = entry[0][1];
                              
                if (transitions.length < 1){
                    
                    transitions.push({[transitionState]:transitionChar})
                    continue;
                }else{

                    for(var i = 0; i<transitions.length; i++){
                    
                        var transitionEntry = Object.entries(transitions[i]);
                        var entryTransitionState = transitionEntry[0][0];
                        var entryTransitionChar = transitionEntry[0][1];
                        
                        
                        if(k=== transitionState && transitionState === entryTransitionState){

                            transitions.pop()

                            entryTransitionChar+="," + transitionChar
                            
                            transitions.push({[transitionState]:entryTransitionChar})
                            break;

                        }else{
                            transitions.push({[transitionState]:transitionChar})
                            break;
                        }
                    }
                    
                }
                
            }
            
            optimizedTransitions[k] = transitions;
            

        });
        
        this.setState({optimizedTransitions : optimizedTransitions})
    }

}