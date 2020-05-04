import React from 'react';
import {DFA, NFA} from '../index'
import fs from "fs";
import 'dotenv/config'

export default class Diagram extends React.Component{
    constructor(props){
        super(props);
        this.state={
            states: null,
            alphabet: null,
            startingState: null,
            finalStates: null,
            transitionFunctions: null,
            strings: null,
            NFA: null
        };
    }

    componentDidMount(){
        console.log(process.env.REACT_APP_file1)
        this.readFiles(String(process.env.REACT_APP_file1).trim() || "", 'utf8', "placefiller");
        
    }

    render(){
        // Conditional Rendering for the different diagrams
            if (this.state.NFA === null){
                return(
                    <div>Loading...</div>
                )
            }else if (this.state.NFA){
                return (
                    <NFA states={this.state.states} alphabet={this.state.alphabet} startingState={this.state.startingState} 
                    finalStates={this.state.finalStates} transitionFunctions={this.state.transitionFunctions} strings={this.state.strings}
                    />
                );
            }else{
                console.log(this.state.NFA)
                return(
                    <DFA states={this.state.states} alphabet={this.state.alphabet} startingState={this.state.startingState} 
                    finalStates={this.state.finalStates} transitionFunctions={this.state.transitionFunctions} strings={this.state.strings}
                    />
                );
            
        }
    }

    readFiles = (definitionPath, stringsPath) => {
        // Reading Automata Definition file:
        console.log(definitionPath)
        var definitionParsed = {};
        var defText = fs.readFileSync(definitionPath).toString("utf-8");

        var defSplit = defText.split("\n");

        for(var i = 0; i < defSplit.length; i++){
            if(defSplit[i].length <= 1 || defSplit[i].includes("M = ") || defSplit[i].includes("where")) continue;

            if(defSplit[i].includes("Starting State")){
                definitionParsed["Starting State"] = defSplit[i].slice(defSplit[i].indexOf("=")+1, defSplit[i].trim().length-1).trim();
                continue;
            }
            
            var oneLineResults = this.oneLineItems(defSplit, i);
            
            var oneLineElement = oneLineResults[0];
            i = oneLineResults[1];

            var parsedResults = this.parseOneLineElement(oneLineElement);
            
            definitionParsed[parsedResults[0]] = parsedResults[1];
        }

        console.log(definitionParsed)
        
        this.setState({
            states: definitionParsed['States'],
            alphabet: definitionParsed['Alphabet'],
            startingState: definitionParsed['Starting State'],
            finalStates: definitionParsed['Final States'],
            transitionFunctions: definitionParsed['Transition']
        });
    }

    /**
     * Due to the file given possibly not resembling any other test file (in terms of new lines)
     * I will take every element and put it into one line by tracking the brackets
     */
    oneLineItems = (items, i) => {
        var foundRightBracket = false;
        if(items[i].includes("}")) return [items[i].trim(), i++];

        var elementsOnOneLine = "";
        while(!foundRightBracket){

            if(items[i].includes("}")){
                elementsOnOneLine += items[i].trim();
                foundRightBracket = true;
            }

            elementsOnOneLine += items[i].trim();

            i++;
        }

        return [elementsOnOneLine, i];
    }

    parseOneLineElement = (element) => {
        var key = element.slice(0, element.indexOf("=")).trim();

        if(key.includes("Transition")){
            key = key.split(" ")[0];
            console.log(key)
            var transitionMappings = {};
            var transitionFunctionsStr = element.slice(element.indexOf("("), element.lastIndexOf(")")+1);
            var transitionFunctionArr = [];

            var start, end = 0;
            for(var i = 0; i < transitionFunctionsStr.length; i++){
                if(transitionFunctionsStr.charAt(i) == "(")  start = i;
                if(transitionFunctionsStr.charAt(i) == ")"){
                    end = i;
                    transitionFunctionArr.push(transitionFunctionsStr.slice(start+1, end).split(',').map(i => i.trim()));
                }
            }
            transitionFunctionArr.forEach(i => {
                var temp = {};
                temp[i[2]] = i[1];
                if(transitionMappings.hasOwnProperty(i[0])){
                    transitionMappings[i[0]].push(temp);
                }else{
                    transitionMappings[i[0]] = [temp];
                }
            });

            this.determineFA(transitionMappings);
            
            return [key, transitionMappings];
        }
        
        var values = element.slice(element.indexOf("{")+1, element.length-2).split(',');

        values = values.map(i => i.trim());

        return [key, values];
    }

    determineFA = (transitionMappings) => {
        var foundE = false;
        for(var key of Object.keys(transitionMappings)){
            for(var items of transitionMappings[key]){
                var entry = Object.entries(items);
                // If epsilon in transition, its an NFA
                if (entry[0][1] === 'e'){
                    foundE=true;
                    console.log(entry[0][1])
                    this.setState({NFA: true})
                    
                }

            }
        }
        // If an e wasn't found, it's a DFA
        
        if (this.state.NFA === null && !foundE) this.setState({NFA: false})
        
    }

    

}