const ui = {

    theChoices: null,
    leftChoice: null,       //      the canvas for the choice
    rightChoice: null,

    leftResult: null,       //      text svg object for "behind the door" text. Child of leftChoice.
    rightResult: null,

    leftDoorCanvas: null,       //  canvas for the door (that obscures the result)
    rightDoorCanvas: null,
    leftDoor: null,             //  the door itself (colored rect)
    rightDoor: null,
    leftDoorLabel: null,        //  text object attached to the door
    rightDoorLabel: null,

    choiceSize: 128,
    choiceGap: 12,

    initialize: function () {
        let theScenarioMenu = document.getElementById("scenarioMenu");
        theScenarioMenu.innerHTML = this.scenarioMenuGuts(lottini.state.scenarioName);
        this.setOptionCheckboxes();

    },

    setOptionCheckboxes : function() {
        document.getElementById("emittingCheckbox").checked = lottini.state.optEmitToCODAP;
        document.getElementById("showAllScenariosCheckbox").checked = lottini.state.optShowAllScenarios;
        document.getElementById("showResultsCheckbox").checked = lottini.state.optShowResults;
    },

    SetScenarioUIObjects: function () {
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

        //  result graphics objects  (e.g., 7 euros, 20 days of food) "behind the door"
        //  that is, these are ui.leftResult and .rightResult. These are set when the
        //  user makes a choice; actually happens in ui.displayResultBehindTheDoor()
        //  which is called from lottini.doChoice().

        this.leftResult = this.leftChoice.append('image')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true);
        this.rightResult = this.rightChoice.append('image')
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
            .text(lottini.scenarioStrings.leftLabel);
        this.rightDoorLabel = this.rightDoorCanvas.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true)
            .text(lottini.scenarioStrings.rightLabel);





        this.leftChoice.on("click", () => lottini.doChoice('left'));
        this.rightChoice.on("click", () => lottini.doChoice('right'));

        //  look of the doors
        if (lottini.scenario.leftDoorLook.color) {
            this.leftDoor.attr('fill', lottini.scenario.leftDoorLook.color);
            this.rightDoor.attr('fill', lottini.scenario.rightDoorLook.color);
        }


        if (lottini.scenario.leftDoorLook.image) {     //  attach image to the door canvas, on top of the door.
            this.leftDoorCanvas.append("image").attr("href", lottini.scenario.leftDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
            this.rightDoorCanvas.append("image").attr("href", lottini.scenario.rightDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
        }

        //  the "story"

        const tStory = document.getElementById("story");
        tStory.innerHTML = lottini.scenarioStrings.story;

        this.showResults();

    },

    displayResultBehindTheDoor: function( iGraphicsObject, iNumber, iUnits) {
        const graphicsFilename = lottini.scenario.image[iNumber];       //      `images/${iNumber}-bears.png`;  //  depends on iNumber
        iGraphicsObject.attr("href", graphicsFilename)
            .attr("height", 106).attr("y", 16).attr("x", 6);
/*
        const bbox = iTextObject.node().getBBox();
        if (bbox.width > ui.choiceSize) {
            iTextObject.attr("textLength", ui.choiceSize - 12);
            iTextObject.attr("lengthAdjust", "spacingAndGlyphs");
        }
*/
    },

    /**
     * display the summary of results so far as a text object.
     */
    showResults: function () {
        const theResultsArea = document.getElementById("results");

        if (lottini.state.optShowResults) {

            const Lresults = lottini.results[lottini.scenarioStrings.leftLabel];
            const Rresults = lottini.results[lottini.scenarioStrings.rightLabel];
            const nTurnsLeft = Lresults.turns;
            const nTurnsRight = Rresults.turns;

            const turnTextLeft = Lresults.turns === 1 ?
                `${Lresults.turns}${lottini.scenarioStrings.turnUnitSingular}` :
                `${Lresults.turns}${lottini.scenarioStrings.turnUnitPlural}`;
            const turnTextRight = Rresults.turns === 1 ?
                `${Rresults.turns}${lottini.scenarioStrings.turnUnitSingular}` :
                `${Rresults.turns}${lottini.scenarioStrings.turnUnitPlural}`;

            const resultTextLeft = Lresults.sum === 1 ?
                `${Lresults.sum}${lottini.scenarioStrings.resultUnitSingular}` :
                `${Lresults.sum}${lottini.scenarioStrings.resultUnitPlural}`;
            const resultTextRight = Rresults.sum === 1 ?
                `${Rresults.sum}${lottini.scenarioStrings.resultUnitSingular}` :
                `${Rresults.sum}${lottini.scenarioStrings.resultUnitPlural}`;

            const theText = `${lottini.scenarioStrings.leftLabel}: ${turnTextLeft} : ${resultTextLeft}<br>
            ${lottini.scenarioStrings.rightLabel}: ${turnTextRight} : ${resultTextRight}`;


            document.getElementById('resultsText').innerHTML = theText;
            theResultsArea.style.visibility = "visible";        //  consider
        } else {
            theResultsArea.style.visibility = "hidden";

        }
    },

    /**
     * Here, `this` is the scenario menu, which calls this function `onchange`.
     */
    changeScenario: function () {
        lottini.setScenario(this.value);
        this.showResults();
    },

    openAndCloseDoor: async function (iDoor) {

        iDoor.transition().attr("y", -(this.choiceSize - 12)).duration(lottini.scenario.fadeTime);
        iDoor.transition().attr("y", 0).delay(lottini.scenario.timeTillFade).duration(lottini.scenario.fadeTime);

    },

    toggleOptions: function () {
        const runIcon = "🏃🏽‍♀️‍";
        const gearIcon = "⚙️";  //  "⚙️"
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

    scenarioMenuGuts: function (iSelected) {
        out = ``;

        for (let lKey in lottini.allScenarios) {
            const theseStrings = localize.defaultStrings.lottini.scenarioStrings[lKey];  // DG.plugins.lottini.scenarioStrings[lKey]
            const theName = theseStrings.label;
            let selectMe = false;

            if (lKey === iSelected) {
                selectMe = true;
            }

            if (lottini.state.optShowAllScenarios || lottini.allScenarios[lKey].allowance) {
                out += `<option value="${lKey}" ${selectMe ? "selected" : ""}>${theName}</option>\n`;
            }
        }
        return out;
    },
}