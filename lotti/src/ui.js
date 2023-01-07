const ui = {

    theChoices: null,
    leftChoice: null,
    rightChoice: null,
    leftDoorCanvas: null,
    rightDoorCanvas: null,
    leftDoor: null,
    rightDoor: null,
    leftDoorLabel: null,
    rightDoorLabel: null,
    leftResult: null,
    rightResult: null,

    choiceSize: 128,
    choiceGap: 12,

    initialize: function () {
        let theLotteryMenu = document.getElementById("lotteryMenu");
        theLotteryMenu.innerHTML = this.lotteryMenuGuts();
    },

    setLotteryUIObjects: function () {
        this.theChoices = d3.select('#choices');

        //  the SVGs that hold the doors, results, etc

        this.leftChoice = this.theChoices.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .style("cursor", "pointer");
        this.rightChoice = this.theChoices.append('svg').attr('x', this.choiceSize + this.choiceGap).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .style("cursor", "pointer");

        //  immovable backgrounds
        this.leftChoice.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .attr('fill', "white");
        this.rightChoice.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .attr('fill', "white");

        //  result text objects
        this.leftResult = this.leftChoice.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true);
        this.rightResult = this.rightChoice.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true);

        //  door frames (canvases)
        this.leftDoorCanvas = this.leftChoice.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);
        this.rightDoorCanvas = this.rightChoice.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);

        this.leftDoor = this.leftDoorCanvas.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);
        this.rightDoor = this.rightDoorCanvas.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);

        //  labels on the doors. Note: these are localized.
        this.leftDoorLabel = this.leftDoorCanvas.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true)
            .text(lotti.lotteryStrings.leftLabel);
        this.rightDoorLabel = this.rightDoorCanvas.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true)
            .text(lotti.lotteryStrings.rightLabel);


        this.leftChoice.on("click", () => lotti.doChoice('left'));
        this.rightChoice.on("click", () => lotti.doChoice('right'));

        //  look of the doors
        if (lotti.lottery.leftDoorLook.color) {
            this.leftDoor.attr('fill', lotti.lottery.leftDoorLook.color);
            this.rightDoor.attr('fill', lotti.lottery.rightDoorLook.color);
        }
        if (lotti.lottery.leftDoorLook.image) {
            this.leftDoorCanvas.append("image").attr("href", lotti.lottery.leftDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
            this.rightDoorCanvas.append("image").attr("href", lotti.lottery.rightDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
        }


            //  the "story"

        const tStory = document.getElementById("story");
        tStory.innerHTML = lotti.lotteryStrings.story;
    },

    /**
     * Here, `this` is the lottery menu, which calls this function `onchange`.
     */
    changeLottery: function () {
        lotti.setLottery(this.value);
    },

    openAndCloseDoor: async function (iDoor) {

        //  const theTextID = `#${iWhichSide}_choice_text`;     //  the background text that gets revealed
        //  const theDoorID = `#${iWhichSide}_door`;            //  what covers the background text

        //  const theDoor = d3.select(theDoorID);

        iDoor.transition().attr("y", -(this.choiceSize - 12)).duration(lotti.lottery.fadeTime);
        iDoor.transition().attr("y", 0).delay(lotti.lottery.timeTillFade).duration(lotti.lottery.fadeTime);
        //  theDoor.style("visibility", "hidden");
        /*
                window.setTimeout(()=> {
                    //  theDoor.style("visibility", "visible");
                    console.log(`    hid ${iDoor.attr('id')}`);
                }, lotti.lottery.timeTillFade);
        */

    },

    toggleOptions: function () {
        const runIcon = "🏃🏽‍♀️‍";
        const gearIcon = "⚙️";
        this.showingOptions = !this.showingOptions;

        if (this.showingOptions) {
            document.getElementById("game").style.display = "none";
            document.getElementById("options").style.display = "block";
            document.getElementById("optionsIcon").innerHTML = runIcon;
        } else {
            document.getElementById("game").style.display = "block";
            document.getElementById("options").style.display = "none";
            document.getElementById("optionsIcon").innerHTML = gearIcon;
        }
    },

    lotteryMenuGuts: function () {
        out = ``;

        for (let lKey in lotti.lotteries) {
            const theName = DG.plugins.lotti.lotteryStrings[lKey].label;
            out += `<option value="${lKey}">${theName}</option>\n`;
        }
        return out;
    },
}