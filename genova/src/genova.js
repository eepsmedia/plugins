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
    playing : true,
    gameOverText : "",
    currentYearData : {},
    gameNumber : 0,

    start : async function() {
        this.gameNumber++;
        await connect.init();
        this.year = this.startingYear;
        this.currentYearData['year'] = this.year;
        this.currentYearData['num'] = this.gameNumber;

        this.theBalance = this.startingBalance;
        this.playing = true;
        this.setStatus();
        this.setMarketReport();
        document.getElementById("sellDiv").style.display = "none";
        document.getElementById("sendDiv").style.display = "none";
        document.getElementById("gameOverDiv").style.display = "none";
        document.getElementById("playingDiv").style.display = "block";
        document.getElementById("damageReport").innerHTML = "Shipping reports will appear here.";
    },

    setPrice: function () {
        let tPrice = document.getElementById("premium").value;
        if (tPrice < 0) {
            tPrice = 0;
            document.getElementById("premium").value = tPrice;
        }
        this.thePrice = tPrice;
        const prospects = this.supplyAndDemand(this.thePrice);
        if (prospects > 0) {
            document.getElementById("sellDiv").style.display = "block";
        }
        this.setMarketReport();
        this.currentYearData['price'] = this.thePrice;
    },

    supplyAndDemand : function(iPrice) {
        const maxPrice = 1000;
        const maxCustomers = 100;

        let tCustomers = Math.floor(maxCustomers - (maxCustomers/maxPrice) * iPrice);
        if (tCustomers < 0) {
            tCustomers = 0;
        }

        return tCustomers;
    },

    sellPolicies : function () {
        //  we always sell policies, but we don't always set a (new) price, so record values here:
        this.currentYearData['bank'] = this.theBalance;     //  starting balance for year

        if (!this.playing) {
            this.playing = true;
            this.theBalance = this.startingBalance;
            this.year = this.startingYear;
        }
        this.nCustomers = this.supplyAndDemand(this.thePrice);
        const revenue = this.thePrice * this.nCustomers;
        this.adjustBalanceBy(revenue);
        const theText = `You sold ${this.nCustomers} policies for ${this.thePrice} each, \
        for a total revenue of ${revenue} lira!`;
        document.getElementById('marketReport').innerHTML = theText;

        document.getElementById("sellDiv").style.display = "none";
        document.getElementById("sendDiv").style.display = "block";

        this.currentYearData['boats'] = this.nCustomers;
    },

    sendShips : function() {
        let theText = `In ${this.year}, ${this.nCustomers} ships sailed from Genova`;

        let nSink = 0;
        for (let i = 0; i < this.nCustomers; i++ ) {
            if (Math.random() < this.pSink) {
                nSink++;
            }
        }
        this.currentYearData['sank'] = nSink;

        if (nSink > 0) {
            const claimAmount = nSink * this.shipCost;
            this.adjustBalanceBy(-claimAmount);
            theText += `, but only ${this.nCustomers - nSink} returned.<br> \
            You had to pay ${claimAmount} lira to the ${nSink} unfortunate policyholder${nSink == 1 ? "" : "s"}.`
        } else {
            theText += `, and they all returned! You don't have to pay out any claims!`
        }

        document.getElementById("damageReport").innerHTML = theText;
        this.nCustomers = 0;
        this.newYear();
    },

    newYear : function() {
        connect.emitData(this.currentYearData); //  emit the previous year's data

        this.year++;
        this.currentYearData['year'] = this.year;

        document.getElementById("sellDiv").style.display = "none";
        document.getElementById("sendDiv").style.display = "none";
        this.setStatus();
        this.setPrice();    //  assume user will use the same price that's in the box.
    },

    adjustBalanceBy : function(iIncome) {
        const startingBalance = this.theBalance;
        this.theBalance += iIncome;
        if (this.theBalance < 0) {
            //  oops, we lost!
            this.gameOverText = `<br>You went bankrupt! You started the year with ${startingBalance} lira,<br>\
            but you had to pay ${-iIncome} lira to your customers.<br>\
            Maybe you should have charged more...`
            this.theBalance = 0;
            this.endGame();
        } else if (iIncome <= 0 && this.theBalance >= this.winningBalance) {
            this.gameOverText = `<br>You now have ${this.theBalance} lira, so you have made a lot of money\
            in ${this.year - this.startingYear} years!<br>\
            That's a win for a Genovese insurance company!`;
            this.endGame();
        }
        this.setStatus();
    },

    endGame : function() {
        this.currentYearData['bank'] = this.theBalance;
        //  connect.emitData(this.currentYearData);

        this.setStatus();
        this.playing = false;
        document.getElementById("gameOverText").innerHTML = this.gameOverText;
        document.getElementById("gameOverDiv").style.display = "block";
        document.getElementById("playingDiv").style.display = "none";
    },

    setStatus : function() {
            const theText = `The year is ${this.year}. \
        You have ${this.theBalance} lira in the bank and ${this.nCustomers} policies.`
            document.getElementById('status').innerHTML = theText;
    },

    setMarketReport : function() {
        let theText = "";
        const howManyWouldBuy = this.supplyAndDemand(this.thePrice);
        if (this.thePrice) {
            theText = `If you charge ${this.thePrice} lira as a premium, ${howManyWouldBuy} ships will buy your policy.`;
        } else {
            theText = `Waiting for a suitable price...`;
        }
        document.getElementById('marketReport').innerHTML = theText;
    },


}