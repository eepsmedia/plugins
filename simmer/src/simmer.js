const simmer = {

    workspace: null,

    variableState: [],
    strings: null,

    initialize: function () {
        simmer.text.initialize();   //  defines `simmer.strings` in the correct language

        this.workspace = Blockly.inject('blocklyDiv', {toolbox: this.toolbox});
        this.workspace.registerButtonCallback("newVariableKey", this.handleNewVariable);

        //  const state = {"variables": [{"name": "foo"},{"name": "bar"}]};
        //  Blockly.serialization.workspaces.load(state, Blockly.getMainWorkspace());

        simmer.connect.initialize();
    },

    run: function () {
        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        console.log(`the code: ${code}`);
        eval(code);             //  dangerous!
    },

    handleNewVariable: function () {
        console.log(`handle new variable`);
        const theName = document.getElementById("simmerNewVariableNameBox").value;
        this.workspace.createVariable(theName);
    },

    constants: {
        version: '2022a',
        dsName: `simmerDataset`,
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