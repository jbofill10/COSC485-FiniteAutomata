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
            ran: false
        };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions.bind(this));
    }

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

        if(this.state.height !== null && 
            this.state.width !== null && 
            this.props.states !== null && 
            this.props.startingState !== null 
            && this.props.finalStates !== null 
            && this.props.transitionFunctions && !this.state.ran){
                
                this.computeStringsOnNFA();
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

        if(this.state.height !== null && this.state.width !== null && this.state.states !== null && this.state.startingState !== null && this.state.finalStates !== null && this.state.transitionFunctions){
            
            return(
                <Network options={graphOptions}>
                    {/* Building States for Graph */}
                    {generateStates(this.props.states, this.props.startingState, this.props.finalStates)}
                    
                    {generateTransitions(this.props.transitionFunctions)}

                </Network>
            );
        }else{
                return(
                    <div>Loading...</div>
                );
            }
    }

    computeStringsOnNFA = () => {
        this.setState({ran:true})
        var strings = fs.readFileSync(String(process.env.REACT_APP_file2)).toString("utf-8").split("\n").filter(e => e.length > 1);

        // String hashmap to contain whether its true or false
        var stringAcceptance = {};

        // Set all strings in the hashmap with a value that is false
        // If the string is accepted in the machine, it is set to true.
        strings.forEach(string => {
            string = string.trim()
            console.log(string)
            stringAcceptance[string] = false;
        })

        strings.forEach(string => {
            string = string.trim();
            // Used to track how far a string has progressed. At the end,
            // if the string is acceptable, the length should be 1. (Since for loop wouldn't continue)
            var stringLength = string.length-1;
            
            // Considering String could be extremely long, I'd rather access from
            // an array vs. using charAt
            var stringArray = string.trim().split("");

            // Queue styled data structure to maintain what current states the machine is at
            var currentStates  = [{[this.props.startingState]: 'e'}];
            
            for (var i = 0; i < stringArray.length; i++){

                var currentChar = stringArray[i];
                // Every time we exhaust the queue (currentStates), we are keeping track of the new
                // transitions that can be checked and is added
                // into the previous queue after exhausted 
                var transitionsFound = [];
                
                for(var stateEntry of currentStates){

                    var currentState = Object.entries(stateEntry)[0][0];

                    currentStates.shift();
                    
                    // Does current state contain a transition? If not, next character
                    if (this.props.transitionFunctions.hasOwnProperty(currentState)){
                        this.props.transitionFunctions[currentState].forEach(transition => {
                            
                            // Technically object.entries returns a 2D array, but it will always be one key value pairing
                            // So I can always use [0][0] and [0][1] to get the values I want 100% of the time 
                            var transitionState = Object.entries(transition)[0][0];
                            var transitionChar = Object.entries(transition)[0][1];
                            
                            
                            // If transition function uses current character
                            if (transitionChar === currentChar || transitionChar === 'e'){
                               
                                transitionsFound.push({[transitionState]: transitionChar});
                                
                            }  
                        })
                    }

                }

                currentStates = JSON.parse(JSON.stringify(transitionsFound));

                    if(i === stringArray.length-1){
                        for(var pairing of currentStates){
                            var state = null;

                            for(var entry of Object.entries(pairing)){
                                state = entry[0];
                            }
                            
                            if (this.props.finalStates.includes(state)){
                                stringAcceptance[string] = true;
                            }

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
    
}