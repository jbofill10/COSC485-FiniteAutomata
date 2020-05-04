import React from 'react';
import { Network } from 'react-vis-network';
import { generateStates } from '../Diagram/States';
import { generateTransitions } from '../Diagram/Transitions';
import fs from "fs";
import 'dotenv/config'


export default class DFA extends React.Component{
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
        this.computeStringsOnDFA();

        if (this.props.states != this.state.states){
            this.setState({states: this.props.states});
        }
        if (this.props.alphabet != this.state.alphabet){
            this.setState({alphabet: this.props.alphabet});
        }
        if (this.props.startingState != this.state.startingState){
            this.setState({startingState: this.props.startingState});
        }
        if (this.props.finalStates != this.state.finalStates){
            this.setState({finalStates: this.props.finalStates});
        }
        if (this.props.transitionFunctions != this.state.transitionFunctions){
            this.setState({transitionFunctions: this.props.transitionFunctions});
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

        if(this.state.height != null && this.state.width != null && this.props.states != null && this.props.startingState != null && this.props.finalStates != null && this.props.transitionFunctions){
            return(
                <Network options={graphOptions}>
                    {/* Building States for Graph */}
                    {generateStates(this.props.states, this.props.startingState, this.props.finalStates)}
                    
                    {generateTransitions(this.props.transitionFunctions)}

                </Network>
            )
        }else{
            
            return(
                <div>Loading...</div>
            )
        }
    }

    computeStringsOnDFA = () => {
        var strings = fs.readFileSync(String(process.env.REACT_APP_file2)).toString("utf-8").split("\n").filter(e => e.length > 1);

        // String hashmap to contain whether its true or false
        var stringAcceptance = {};

        // Set all strings in the hashmap with a value that is false
        // If the string is accepted in the algorithm, it is set to true.
        strings.forEach(string => {
            stringAcceptance[string] = false;
        })
        
        var currentState = "";

        strings.forEach(string => {
            
            // Used to track how far a string has progressed. At the end,
            // if the string is acceptable, the length should be 1. (Since for loop wouldn't continue)
            var stringLength = string.length-1;
            
            // Considering String could be extremely long, I'd rather access from
            // an array vs. using charAt
            var stringArray = string.trim().split("");
            currentState  = this.props.startingState;

            for (var i = 0; i < stringArray.length; i++){
                var currentChar = stringArray[i];
                // Does current state contain a transition function? If not, next character
                if (this.props.transitionFunctions.hasOwnProperty(currentState)){
                    this.props.transitionFunctions[currentState].forEach(transition => {
                        
                        // Technically object.entries returns a 2D array, but it will always be one key value pairing
                        // So I can always use [0][0] and [0][1] to get the values I want 100% of the time 
                        var transitionState = Object.entries(transition)[0][0];
                        var transitionChar = Object.entries(transition)[0][1];

                        // If transition function uses current character
                        if (transitionChar === currentChar){
                            currentState = transitionState;
                            stringLength--;
                            // If all characters have been processed and is in a final state
                            if (stringLength == 0 && this.props.finalStates.includes(currentState)){
                                stringAcceptance[string] = true;
                            }
                            return;
                        }  
                    })
                }else{
                    // JavaScript's .forEach function does not let you use continue/break
                    // Return has the same effect as continue (moving to next char).
                    return;
                }
            }
        })

        console.log(stringAcceptance);

    }



}