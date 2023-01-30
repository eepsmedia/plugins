/* global codapInterface, Blockly, pluginHelper   */


const simmer = {

    state: {},
    theVariables: [],
    workspace: null,
    shrunken: false,

    variableState: [],
    strings: null,

    initialize: async function () {
        simmer.text.initialize();   //  defines `simmer.strings` in the correct language

        const tOptions = {
            toolbox: this.toolbox,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            }
        }
        this.workspace = Blockly.inject('blocklyDiv', tOptions);
        //  this.workspace.registerButtonCallback("newVariableKey", this.handleNewVariable);
        bEvents.register();

        await simmer.connect.initialize();
        simmer.setUpState();
    },

    setUpState: function () {
        simmer.state = codapInterface.getInteractiveState();
        if (Object.keys(simmer.state).length === 0) {
            simmer.state = simmer.constants.freshState;
            codapInterface.updateInteractiveState(simmer.state);

        } else {
            bEvents.restore(simmer.state);
        }
    },

    /**
     * User presses the **Run** button!
     *
     * We retrieve the code from the block workspace and then run it.
     *
     * @returns {Promise<void>}
     */
    run: async function () {

        /**
         * See if two arrays are equal. We do this because we need to see if the
         * set of variables has changed.
         * @param a     one Array
         * @param b     the other Array
         * @returns {false|*}   Boolean, if the two arrays are equal
         */
        function arrayEquality(a, b) {
            const lengthsOK = a.length === b.length;
            const contentsOK = a.every((v, i) => v.name === b[i].name);
            return (lengthsOK && contentsOK);
        }

        simmer.state.simmerRun++;   //  increment the "run number"

        const theOldVariables = this.state.theVariables;
        this.state.theVariables = simmer.constructVariableNameArray();

        if (!arrayEquality(theOldVariables, this.state.theVariables)) {
            //  the variables changed. Nuke the old dataset, make a fresh one.
            simmer.connect.deleteDataset();
            await simmer.connect.createSimmerDataset(this.state.theVariables);
            console.log(`Change in variables! New dataset!`);
        } else {
            if (!await simmer.connect.datasetExists(simmer.constants.dsName)) {
                await simmer.connect.createSimmerDataset(this.state.theVariables);
                console.log(`Had to make a new dataset.`);
            }
            console.log(`NO change in variables! Keep old dataset.`);
        }

        //  actually retrieve the code from Blockly
        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        console.log(`the code: \n\n${code}`);

        //  const executed = Function(`"use strict"; return (${code})`);

        eval(code);             //  dangerous!
        simmer.connect.makeTableAppear();   //  because it's simpler for the user

    },

    handleNewVariable: function () {
        console.log(`handle new variable`);
        const theName = document.getElementById("newVariableNameBox").value;
        this.workspace.createVariable(theName);
    },

    shrink: function () {
        this.shrunken = !this.shrunken;

        //  hide/unhide  the blockly div

        document.getElementById(`blocklyDiv`).style.display
            = (this.shrunken) ? "none" : "block";

        //  hide/unhide unnecessary controls

        document.getElementById(`newVariableControls`).style.display
            = (this.shrunken) ? "none" : "inline";

        //  hide/unhide reminder text

        document.getElementById(`variableChangeReminderText`).style.display
            = (this.shrunken) ? "none" : "block";

        //  shrink/grow the frame

        simmer.connect.shrinkFrame();

        //  hide/unhide shrink/expand buttons

        document.getElementById("shrinkButton").style.display
            = simmer.shrunken ? "none" : "inline";
        document.getElementById("expandButton").style.display
            = simmer.shrunken ? "inline" : "none";
    },

    /**
     * Make an array of the names of all the variables currently defined in the Blockly workspace
     * Each element is {"name" : <the name>}.
     */
    constructVariableNameArray: function () {
        const theVariables = Blockly.getMainWorkspace().getAllVariables();

        let out = [{
            "name": simmer.text.en.simmerRunName,
            "type": "categorical",
            "description": simmer.text.en.simmerRunDescription,
        }];    //  the default
        theVariables.forEach((v) => {
            out.push({"name": v.name});
        })
        return out;
    },

    constants: {
        version: '2023a',
        dsName: `simmerDataset`,
        freshState: {
            theVariables: [],
            blocklyWorkspace: {},
            simmerRun: 0,
        }
    },

}