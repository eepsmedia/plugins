

const lotti = {

    lottery : null,
    showingOptions : false,
    theGame : null,
    lotteryStrings : null,

    initialize : function() {
        this.theGame = d3.select("#game");
        lotti.strings.initialize(); //  strings first!
        lotti.connect.initialize();
        ui.initialize();
        this.setLottery();
    },

    doChoice :  async function(iWhichSide) {
        const theLotteryStrings = DG.plugins.lotti.lotteryStrings[lotti.lottery.name];
        //  const theTextID = iWhichSide + '_choice_text';
        //  const theDoorID = iWhichSide + '_door';

        const tPlainResult = this.lottery.result(iWhichSide, this.lottery.left, this.lottery.right);
        const tResultWithUnits = this.resultWithUnits(tPlainResult, theLotteryStrings);
        const tChoiceText = (iWhichSide === 'left') ? lotti.lotteryStrings.leftLabel : lotti.lotteryStrings.rightLabel;
        const theDoor =  (iWhichSide === 'left') ? ui.leftDoorCanvas : ui.rightDoorCanvas;
        const theResult =  (iWhichSide === 'left') ? ui.leftResult : ui.rightResult;

        theResult.text(tResultWithUnits);     //  set the text within the "result" element
        console.log(`result is ${tResultWithUnits}`);

        if (document.getElementById("emittingCheckbox").checked) {
            const theValues = {
                rules : lotti.lottery.name,
                choice : tChoiceText,
                result : tPlainResult,
                units : theLotteryStrings.resultUnitPlural,
            }
            lotti.connect.codap_emit(theValues);
        }
        ui.openAndCloseDoor(theDoor);
    },

    resultWithUnits : function(iNumber, iLotteryStrings) {
        const unitString = iNumber === 1 ? iLotteryStrings.resultUnitSingular : iLotteryStrings.resultUnitPlural;
        return `${iNumber}${unitString}`;
    },

    setLottery : function(iLottery) {
        if (!iLottery) {
            iLottery = document.getElementById("lotteryMenu").value;
        }

        lotti.lottery = lotti.lotteries[iLottery];
        lotti.connect.setNewDataset(lotti.lottery.name);
        this.lotteryStrings = DG.plugins.lotti.lotteryStrings[iLottery];
        ui.setLotteryUIObjects();
    },

    constants : {
        version : "2023a",
        dsName : "lottiDataset",
        collName : "records",
    }

}
