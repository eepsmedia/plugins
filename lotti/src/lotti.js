

const lotti = {

    lottery : null,
    showingOptions : false,

    initialize : function() {
        lotti.strings.initialize(); //  strings first!
        lotti.connect.initialize();
        ui.initialize();
        this.setLottery();
    },

    doChoice :  async function(iWhichSide) {
        const theTextID = iWhichSide + '_choice_text';
        const theDoorID = iWhichSide + '_door';
        const theUnits = DG.plugins.lotti.lotteryStrings[lotti.lottery.name].resultUnits;

        const tPlainResult = this.lottery.result(iWhichSide, this.lottery.left, this.lottery.right);
        const tResultWithUnits = `${tPlainResult}${theUnits}`;
        console.log(`result is ${tResultWithUnits}`);

        if (document.getElementById("emittingCheckbox").checked) {
            const theValues = {
                rules : lotti.lottery.name,
                choice : DG.plugins.lotti[iWhichSide],
                result : tPlainResult,
                units : theUnits,
            }
            lotti.connect.codap_emit(theValues);
        }

        const theTextElement = document.getElementById(theTextID);
        theTextElement.innerHTML = tResultWithUnits;     //  set the result text
        ui.openAndCloseDoor(document.getElementById(theDoorID));
    },

    setLottery : function(iLottery) {
        if (!iLottery) {
            iLottery = document.getElementById("lotteryMenu").value;
        }

        lotti.lottery = lotti.lotteries[iLottery];
        lotti.connect.setNewDataset(lotti.lottery.name);
    },

    constants : {
        version : "2022a",
        dsName : "lottiDataset",
        collName : "records",
    }

}
