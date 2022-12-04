const ui = {

    initialize : function() {
        let theLotteryMenu = document.getElementById("lotteryMenu");
        theLotteryMenu.innerHTML = this.lotteryMenuGuts();
    },

    changeLottery : function() {
        lotti.setLottery(this.value);
    },

    openAndCloseDoor : async function(iDoor) {

        iDoor.style.visibility = 'hidden';
        //  iElement.classList.add('opaque');
        window.setTimeout(()=> {
            iDoor.style.visibility = 'visible';
            //  iElement.classList.toggle('transparent');
            console.log(`    hid ${iDoor.outerHTML}`);
        }, lotti.lottery.timeTillFade);

    },

    toggleOptions : function() {
        const   runIcon = "🏃🏽‍♀️‍";
        const   gearIcon = "⚙️";
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

    lotteryMenuGuts : function() {
        out = ``;

        for (let lKey in lotti.lotteries) {
            const theName =  DG.plugins.lotti.lotteryStrings[lKey].label;
            out += `<option value="${lKey}">${theName}</option>\n`;
        }
        return out;
    },
}