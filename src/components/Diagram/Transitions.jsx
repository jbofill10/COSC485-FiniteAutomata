import React from 'react';
import {Edge} from 'react-vis-network';

export function generateTransitions(transitionFunctions){

    return(
        Object.entries(transitionFunctions).map(([k,v]) => {

            return v.map((obj, index) => {

                var transitionState = Object.keys(obj)[0];
                var transitionVar = obj[Object.keys(obj)[0]];
                
                return <Edge key={index} id={k+"_to_"+transitionState+"_"+transitionVar} arrows='to' from={k} to={transitionState} label={transitionVar}/>
                
            })})
    );
}
