
const handlers = {
    /**
     * User has clicked a button that changes whether a test is one- or two-sided
     */
    changeTestSides : function() {
        const iSign = document.getElementById(`sidesButton`).value;    // 1 or 2
        data.parameters.sides = (iSign === `≠`) ? 1 : 2;
        ui.redraw();
    },

    changeAlpha : function() {
        const a = document.getElementById(`alphaBox`);
        data.parameters.alpha = a.value;
        ui.redraw();
    },

    changeValue : function() {
        const v = document.getElementById(`valueBox`);
        data.parameters.value = v.value;
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