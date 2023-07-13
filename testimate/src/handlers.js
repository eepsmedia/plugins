
const handlers = {
    /**
     * User has clicked a button that changes whether a test is one- or two-sided
     */
    changeTestSides : function() {
        const iSign = document.getElementById(`sidesButton`).value;    // 1 or 2
        tests.parameters.sides = (iSign === `≠`) ? 1 : 2;
        ui.redraw();
    },

    changeConf : function() {
        const a = document.getElementById(`confBox`);
        tests.parameters.conf = a.value;
        tests.parameters.alpha = 1 - tests.parameters.conf/100;
        ui.redraw();
    },

    changeAlpha : function() {
        const a = document.getElementById(`alphaBox`);
        tests.parameters.alpha = a.value;
        tests.parameters.conf = 100 * (1 - tests.parameters.alpha);
        ui.redraw();
    },

    changeValue : function() {
        const v = document.getElementById(`valueBox`);
        tests.parameters.value = v.value;
        ui.redraw();
    },

    changeTest : function() {
        const T = document.getElementById(`testMenu`);
        testimate.state.test = T.value;
        ui.redraw();
    },

    changeCN : function(iXY) {
        const aName = (iXY === 'x') ? testimate.state.xName : testimate.state.yName;
        const newType = (testimate.state.dataTypes[aName] === 'numeric' ? 'categorical' : 'numeric');
        testimate.state.dataTypes[aName] = newType;
        ui.redraw();
    },

    setTestParameters : function(iType) {
        switch(iType) {
            case `N1`:
                const theValue = document.getElementById("valueBox").value;
                const theAlpha = document.getElementById("alphaBox").value;
                const theSides = document.getElementById("sidesButton").value;
                break;

            default:
                break;
        }
    },

}