import React from 'react';
import { Network } from 'react-vis-network';
import { generateStates } from '../Diagram/States';
import { generateTransitions } from '../Diagram/Transitions';
import fs from "fs";
import 'dotenv/config'


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
            test: true
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

        if(this.state.height != null && this.state.width != null && this.state.states != null && this.state.startingState != null && this.state.finalStates != null && this.state.transitionFunctions){
            
            return(
                <Network options={graphOptions}>
                    {/* Building States for Graph */}
                    {generateStates(this.props.states, this.props.startingState, this.props.finalStates)}
                    
                    {generateTransitions(this.props.transitionFunctions)}

                </Network>
            );
        }else{
            console.log(this.state.states)
            console.log(this.state.startingState)
            console.log(this.state.finalStates)
            console.log(this.state.transitionFunctions)
                return(
                    <div>Loading...</div>
                );
            }
    }
}