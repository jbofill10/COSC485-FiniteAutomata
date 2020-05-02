import React from 'react';
import { Network, Node, Edge } from 'react-vis-network';


export default class DFA extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            width: null,
            height: null,
            networkList:null
        };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions.bind(this));
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
                    {this.props.states.map((state, index) => {
                        if (this.props.startingState === state){
                            return <Node key={index} id={state} label={state} color={'#ffb6b6'}/>
                        }else if(this.props.finalStates.includes(state)){
                            return <Node key={index} id={state} label={state} color={'#900c3f'}/>
                        }else{
                            return <Node key={index} id={state} label={state}/>
                        }
                    })}
                    
                    {Object.entries(this.props.transitionFunctions).map(([k,v]) => {

                            return v.map((obj, index) => {

                                var transitionState = Object.keys(obj)[0];
                                var transitionVar = obj[Object.keys(obj)[0]];
                                
                                return <Edge key={index} id={k+"_to_"+transitionState} arrows='to' from={k} to={transitionState} label={transitionVar}/>
                                
                            })})}
                </Network>
            )
        }else{
            return(
                <div>Loading...</div>
            )
        }
    }



}