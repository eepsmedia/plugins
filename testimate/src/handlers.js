const handlers = {
    /**
     * User has clicked a button that changes whether a test is one- or two-sided
     */
    changeTestSides: function () {
        const iSign = document.getElementById(`sidesButton`).value;    // 1 or 2
        testimate.state.testParams.sides = (iSign === `≠`) ? 1 : 2;
        ui.redraw();
    },

    changeConf: function () {
        const a = document.getElementById(`confBox`);
        testimate.state.testParams.conf = a.value;
        testimate.state.testParams.alpha = 1 - testimate.state.testParams.conf / 100;
        ui.redraw();
    },

    changeAlpha: function () {
        const a = document.getElementById(`alphaBox`);
        testimate.state.testParams.alpha = a.value;
        testimate.state.testParams.conf = 100 * (1 - testimate.state.testParams.alpha);
        ui.redraw();
    },

    changeValue: function () {
        const v = document.getElementById(`valueBox`);
        testimate.state.testParams.value = v.value;
        ui.redraw();
    },

    changeIterations: function () {
        const v = document.getElementById(`iterBox`);
        testimate.state.testParams.iter = v.value;
        ui.redraw();
    },

    changeRate: function () {
        const v = document.getElementById(`rateBox`);
        testimate.state.testParams.rate = v.value;
        ui.redraw();
    },

    changeLogisticRegressionProbe: function () {
        const LRP = document.getElementById(`logisticRegressionProbeBox`);
        testimate.state.testParams.probe = LRP.value; //  need for state and restore
        ui.redraw();
    },

    changeTest: function () {
        const T = document.getElementById(`testMenu`);
        testimate.makeFreshTest(T.value); //  need for state and restore
        ui.redraw();
    },

    changeGroup0: function () {
        const initialGroup = testimate.state.testParams.group;
        const valueSet = [...data.xAttData.valueSet];
        const nextValue = this.nextValueInList(valueSet, initialGroup);
        testimate.setNewGroupingValue(nextValue);
        ui.redraw();
    },

    changeGoodnessProp(iLast) {
        console.log(`changing goodness prop for ${iLast}`);
        const theTest = testimate.theTest;

        let propSum = 0;
        const lastGroup = theTest.results.groupNames[theTest.results.groupNames.length - 1];

        theTest.results.groupNames.forEach(g => {
            let theBoxValue = 0;
            if (g !== lastGroup) {
                theBoxValue = Number(document.getElementById(`GProp_${g}`).value);
                const oldPropSum = propSum
                propSum += theBoxValue;
                if (propSum > 1) {
                    theBoxValue = 1 - oldPropSum;
                    propSum = 1;
                }
            } else {    //  the last one!
                theBoxValue = 1 - propSum;
                const theLastBox = document.getElementById("lastProp");
                theLastBox.innerHTML = ui.numberToString(theBoxValue);
            }
            testimate.state.testParams.groupProportions[g] = (theBoxValue);
        })
        ui.redraw();
    },

    showLogisticGraph() {
        const formulas = testimate.theTest.makeFormulaString();
        connect.showLogisticGraph(formulas.longFormula);
    },

    nextValueInList: function (iList, iValue) {
        const iOrig = iList.indexOf(iValue);
        const iNext = (iOrig > iList.length) ? 0 : iOrig + 1;
        return iList[iNext];
    },

    /**
     * Change the TYPE (categorical or numeric = CN) of the attribute
     * @param iXY
     */
    changeCN: function (iXY) {
        const aName = (iXY === 'x') ? testimate.state.x.name : testimate.state.y.name;
        const newType = (testimate.state.dataTypes[aName] === 'numeric' ? 'categorical' : 'numeric');
        testimate.state.dataTypes[aName] = newType;
        ui.redraw();
    },

    /**
     * remove the attribute indicated
     * @param iXY
     */
    trashAttribute: function (iXY) {
        console.log(`removing attribute [${iXY}]`);
        testimate.state[iXY] = null;
        testimate.theTest = null;
        data.xAttData = null;
        data.yAttData = null;
        data.dirtyData = true;
        ui.redraw();
    },

    /**
     * emit test results to CODAP
     */
    emit: function () {
        const theTest = testimate.theTest;
        console.log(`N = ${theTest.results.N}, P = ${theTest.results.P}`);
        connect.emitTestData();
    },

}