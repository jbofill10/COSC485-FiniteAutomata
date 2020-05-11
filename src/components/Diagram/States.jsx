import React from 'react';
import {Node} from 'react-vis-network';

    export function generateStates(states, startingState, finalStates){
        return(
            states.map((state, index) => {
                if (startingState === state){
                    
                    return <Node key={index} id={state} label={state} color={finalStates.includes(state) ? '#af8baf' :'#75daad'}/>
                }else if(finalStates.includes(state)){
                    return <Node key={index} id={state} label={state} color={'#f34573'}/>
                }else{
                    return <Node key={index} id={state} label={state}/>
                }
            })
        );
    }