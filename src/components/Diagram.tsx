import React from 'react';
import {DFA, NFA} from "./index";
import fs from 'fs';

export default class Diagram extends React.Component{
    constructor(props: any){
        super(props);
        this.state={
            definition: null,
            strings: null
        };
    }

    componentDidMount(){
        this.readFiles(String(process.env.file1), "placefiller");
    }

    render(){
        return(
            <DFA/>
        );
    }

    readFiles = (definitionPath: string, stringsPath: string) => {
        // Reading Automata Definition file:
        var definitionParsed: {[key: string]: any} = {};
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

        console.log(definitionParsed);
    }

    /**
     * Due to the file given possibly not resembling any other test file (in terms of new lines)
     * I will take every element and put it into one line by tracking the brackets
     */
    oneLineItems = (items : string[], i: number): any => {
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

    parseOneLineElement = (element: string): any => {
        var key = element.slice(0, element.indexOf("=")).trim();

        if(key == "Transition Function"){
            var transitionMappings:any = {};
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
                var temp:any = {};
                temp[i[2]] = i[1];
                if(transitionMappings.hasOwnProperty(i[0])){
                    transitionMappings[i[0]].push(temp);
                }else{
                    transitionMappings[i[0]] = [temp];
                }
            });

            return [key, transitionMappings];
        }
        
        var values = element.slice(element.indexOf("{")+1, element.length-2).split(',');

        values = values.map(i => i.trim());

        return [key, values];
    }

    

}