const genova = {

    startingYear : 1347,    //      1347 first marine insurance contract, Genova.
    year : 0,
    thePrice : null,
    nCustomers : 0,
    shipCost : 10000,
    startingBalance : 100000,
    theBalance : 0,
    winningBalance : 200000,
    pSink : 0.05,
    nSank : 0,
    playing : true,
    gameOverText : "",
    currentYearData : {},
    gameNumber : 0,

    start : async function() {
        this.gameNumber++;
        await localize.initialize(localize.figureOutLanguage('en'));
        await connect.init();
        this.year = this.startingYear;
        this.theBalance = this.startingBalance;

        this.currentYearData[localize.getString("attributeNames.before")] = this.theBalance;

        this.playing = true;
        this.setStatus();
        this.setMarketReport();
        const tCurrentPremiumPrice = document.getElementById("premium").value;
        document.getElementById("sellDiv").style.display = (tCurrentPremiumPrice === "") ? "none" : "block";
       //    document.getElementById("sendDiv").style.display = "none";
        document.getElementById("gameOverDiv").style.display = "none";
        document.getElementById("playingDiv").style.display = "block";
        document.getElementById("damageReport").innerHTML = localize.getString("shippingWillAppear");
    },

    /**
     * Called when the user changes the price in the box
     * Also called at the new year
     *
     * Calls `supplyAndDemand()` to calculate the number of policies that will sell
     *
     * Calls `setMarketReport()` to show the user the consequences
     */
    setPrice: function () {
        let tPrice = document.getElementById("premium").value;

        if (tPrice === "") {
            this.thePrice = null;
            this.setMarketReport(-1);
        } else {
            if (tPrice < 0) {
                tPrice = 0;
                document.getElementById("premium").value = tPrice;
            }
            this.thePrice = tPrice;
            const prospects = this.supplyAndDemand(this.thePrice);
            this.setMarketReport(prospects);
        }
    },

    supplyAndDemand : function(iPrice) {

        let tCustomers = Math.floor(k.kMaxCustomers - (k.kMaxCustomers/k.kMaxPrice) * iPrice);
        if (tCustomers < 0) {
            tCustomers = 0;
        }

        return tCustomers;
    },

    sellAndSend : async function() {
        await this.sellPolicies();
        await this.sendShips();
        this.newYear();
    },

    sellPolicies : async function () {
        //  we always sell policies, but we don't always set a (new) price, so record values here:
        if (!this.playing) {
            this.playing = true;
            this.theBalance = this.startingBalance;
            this.year = this.startingYear;
        }
        this.nCustomers = this.supplyAndDemand(this.thePrice);
        const revenue = this.thePrice * this.nCustomers;
        this.adjustBalanceBy(revenue);

        const theText = localize.getString("salesReport", this.nCustomers, this.thePrice, revenue);

        document.getElementById('marketReport').innerHTML = theText;

        document.getElementById("sellDiv").style.display = "none";

        //  automatically make the table appear
        connect.makeCaseTableAppear(k.kGenovaDatasetName, localize.getString("datasetTitle"));
    },

    sendShips : async function() {
        let theText =
            localize.getString("howManySailed", this.year, this.getShipsPhrase(this.nCustomers));

        //  `In ${this.year}, ${this.nCustomers} ships sailed from Genova`;

        this.nSank = 0;
        for (let i = 0; i < this.nCustomers; i++ ) {
            if (Math.random() < this.pSink) {
                this.nSank++;
            }
        }

        if (this.nSank > 0) {
            const claimAmount = this.nSank * this.shipCost;
            this.adjustBalanceBy(-claimAmount);
            theText += (this.nSank === 1) ?
                localize.getString('sinkReportOne', this.nCustomers - this.nSank, claimAmount) :
                localize.getString('sinkReportMany', this.nCustomers - this.nSank, claimAmount, this.nSank);
        } else {
            theText += localize.getString('sinkReportNone');
        }

        document.getElementById("damageReport").innerHTML = theText;
    },

    newYear : function() {
        this.currentYearData[localize.getString("attributeNames.gameNumber")] = this.gameNumber;
        this.currentYearData[localize.getString("attributeNames.price")] = this.thePrice;
        this.currentYearData[localize.getString("attributeNames.year")] = this.year;
        this.currentYearData[localize.getString("attributeNames.after")] = this.theBalance;
        this.currentYearData[localize.getString("attributeNames.sank")] = this.nSank;
        this.currentYearData[localize.getString("attributeNames.ships")] = this.nCustomers;

        connect.emitData(this.currentYearData); //  emit the previous year's data

        this.year++;
        this.currentYearData[localize.getString("attributeNames.before")] = this.theBalance;

        document.getElementById("sellDiv").style.display = "none";

        this.setStatus();
        this.setPrice();    //  assume user will use the same price that's in the box.
    },

    adjustBalanceBy : function(iIncome) {
        const startingBalance = this.theBalance;
        this.theBalance += iIncome;
        if (this.theBalance < 0) {
            //  oops, we lost!
            this.gameOverText = localize.getString("gameOverLoss", startingBalance, -iIncome);
            this.theBalance = 0;
            this.endGame();
        } else if (iIncome <= 0 && this.theBalance >= this.winningBalance) {
            //  yay! We won!
            this.gameOverText = localize.getString("gameOverWin", this.theBalance, this.year - this.startingYear);
            this.endGame();
        }
        this.setStatus();
    },

    endGame : function() {
        this.setStatus();
        this.playing = false;
        document.getElementById("gameOverText").innerHTML = this.gameOverText;
        document.getElementById("gameOverDiv").style.display = "block";
        document.getElementById("playingDiv").style.display = "none";
    },

    setStatus : function() {
        //  the year is 1375. You have 70000 lira in the bank
            const theText = localize.getString("currentStatus", this.year, this.theBalance);
            document.getElementById('status').innerHTML = theText;
    },

    setMarketReport : function(prospects) {
        if (prospects >= 0) {
            document.getElementById("sellDiv").style.display = "block";
        } else {
            document.getElementById("sellDiv").style.display = "none";
        }

        //  fill in the sell prompt (when you're ready, press the button)

        document.getElementById("sellPrompt").innerHTML =
            localize.getString(
                "pricePrompt",
                localize.getString("staticStrings.sellButton"),
                this.getShipsPhrase(prospects)
            );

        //  fill in the market report (If you use this price, you'll sell this many policies)

        let theText = "";
        const howManyWouldBuy = this.supplyAndDemand(this.thePrice);
        if (this.thePrice) {
            theText = localize.getString("ifYouCharge", this.thePrice, this.getShipsPhrase(prospects));
        } else {
            theText = localize.getString("waitingForPrice");
        }
        document.getElementById('marketReport').innerHTML = theText;
        return howManyWouldBuy;
    },

    getShipsPhrase : function(customers) {
        return (customers === 1) ?
            `${localize.getString("one")} ${localize.getString("ship")}` :
            `${customers} ${localize.getString("ships")}`;
    },


}

const k = {
    kVersion : "2024b",
    kGenovaDatasetName : 'genovaData',
    kMaxPrice : 1000,
    kMaxCustomers : 100,
};
