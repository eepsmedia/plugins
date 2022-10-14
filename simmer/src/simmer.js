/* global codapInterface, Blockly   */


const simmer = {

    state : {},
    theVariables : [],
    workspace: null,

    variableState: [],
    strings: null,

    initialize: async function () {
        simmer.text.initialize();   //  defines `simmer.strings` in the correct language

        this.workspace = Blockly.inject('blocklyDiv', {toolbox: this.toolbox});
        //  this.workspace.registerButtonCallback("newVariableKey", this.handleNewVariable);
        bEvents.register();

        //  const state = {"variables": [{"name": "foo"},{"name": "bar"}]};
        //  Blockly.serialization.workspaces.load(state, Blockly.getMainWorkspace());
        await simmer.connect.initialize();
        simmer.setUpState();
    },

    setUpState : function() {
        simmer.state = codapInterface.getInteractiveState();
        if (Object.keys(simmer.state).length === 0) {
            simmer.state = simmer.constants.freshState;
            codapInterface.updateInteractiveState(simmer.state);

        } else {
            bEvents.restore(simmer.state);
        }
    },

    run: async function () {

        function arrayEquality(a, b) {
            const lengthsOK = a.length === b.length;
            const contentsOK = a.every((v, i) => v.name === b[i].name);
            return (lengthsOK && contentsOK);
        }

        simmer.state.simmerRun++;

        const theOldVariables = this.theVariables;
        this.theVariables = simmer.constructVariableNameArray();

        if (!arrayEquality(theOldVariables, this.theVariables)) {
            simmer.connect.deleteDataset();
            const dataContextSetupObject = simmer.connect.makeDataContextSetupObject(this.theVariables);
            await pluginHelper.initDataSet(dataContextSetupObject);
            console.log(`change in variables!`);
        } else {
            console.log(`NO change in variables!`);

        }

        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        console.log(`the code: ${code}`);
        eval(code);             //  dangerous!
        simmer.connect.makeTableAppear();

    },

    handleNewVariable: function () {
        console.log(`handle new variable`);
        const theName = document.getElementById("simmerNewVariableNameBox").value;
        this.workspace.createVariable(theName);
    },

    /**
     * Make an array of the names of all the variables currently defined in the Blockly workspace
     * Each element is {"name" : <the name>}.
     */
    constructVariableNameArray : function() {
        const theVariables = Blockly.getMainWorkspace().getAllVariables();

        let out = [{"name" : "simmerRun"}];    //  the default
        theVariables.forEach( (v) => {
            out.push({"name" : v.name});
        })
        return out;
    },

    constants: {
        version: '2022b',
        dsName: `simmerDataset`,
        freshState : {
            blocklyWorkspace: {},
            simmerRun : 0,
        }
    },

    toolbox: {
        "kind": "categoryToolbox",
        "contents": [

            //      random

            {
                "kind": "category",
                "name": "Random",
                "contents": [
                    {
                        'kind': 'block',
                        'type': 'random_integer'
                    },
                    {
                        'kind': 'block',
                        'type': 'random_pick'
                    },
                    {
                        'kind': 'block',
                        'type': 'random_pick_from_two'
                    },
                    {
                        'kind': 'block',
                        'type': 'random_normal'
                    },
                ]
            },

            //      logic

            {
                "kind": "category",
                "name": "Logic & Control",
                "contents": [
                    {
                        "kind": "block",
                        "type": "controls_if"
                    },
                    {
                        "kind": "block",
                        "type": "controls_repeat_ext",
                        "inputs": {
                            "TIMES": {
                                "block": {
                                    "type": "math_number",
                                    "fields": {
                                        "NUM": 10
                                    }
                                }
                            }
                        }
                    },
                    {
                        "kind": "block",
                        "type": "logic_compare"
                    },
                    {
                        "kind": "block",
                        "type": "controls_whileUntil",
                    },
                ]
            },

            //      variables

            {
                "kind": "category",
                "name": "Variables",
                "contents": [
                    /*
                                        {
                                            "kind": "button",
                                            "text": "New variable",
                                            "callbackKey": "newVariableKey"
                                        },
                    */

                    {
                        "kind": "block",
                        "type": "codap_emit"
                    },
                    {
                        "kind": "block",
                        "type": "variables_set"
                    },
                    {
                        "kind": "block",
                        "type": "variables_get"
                    },
                ]
            },

            //      other

            {
                "kind": "category",
                "name": "Other",
                "contents": [
                    {
                        "kind": "block",
                        "type": "text_print"
                    },
                    {
                        "kind": "block",
                        "type": "lists_create_with",
                        "mutation_items": "2"
                    },

                    {
                        "kind": "block",
                        "type": "math_number"
                    },
                    {
                        "kind": "block",
                        "type": "math_arithmetic"
                    },
                    {
                        "kind": "block",
                        "type": "text"
                    },
                ]
            },

        ]
    },

}