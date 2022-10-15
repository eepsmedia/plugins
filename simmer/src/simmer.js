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

        let out = [{
            "name" : simmer.text.en.simmerRunName,
            "type" : "categorical",
            "description" : simmer.text.en.simmerRunDescription,
        }];    //  the default
        theVariables.forEach( (v) => {
            out.push({"name" : v.name});
        })
        return out;
    },

    constants: {
        version: '2022c',
        dsName: `simmerDataset`,
        freshState : {
            blocklyWorkspace: {},
            simmerRun : 0,
        }
    },

}