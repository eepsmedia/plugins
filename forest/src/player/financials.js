import * as Player from './player.js';
import * as Localize from "../../strings/localize.js"
import * as God from "../god/god.js";


//  annualReportData is an object with year, startingBalance, and lineItems.
//  lineItems is an array. Each lineItem is an object with amount, reason, notes, balanceAfter.
//  for tree income, notes is an object created in Tree.js with treeNo, totalValue, and harvesters (an Array)

let yearList = [];      //      Array of strings; keys in rawData.

let year = "";      //      a string

let rawData = {};

let currentData = {};

export function update(iYear = "") {
    year = iYear || Player.year;
    const ready = prepFinancials();

    if (ready) {
        document.getElementById("financeHeader").style.display = "block";
        const tableGuts =  makeFinancialTableGuts();
        document.getElementById("financeTable").innerHTML = tableGuts.guts;
        document.getElementById("financeTableNotes").innerHTML = tableGuts.notes;
        document.getElementById("menuFinancialYears").value = year;

    } else {
        document.getElementById("financeHeader").style.display = "none";
        document.getElementById("financeTableNotes").innerHTML = Localize.getString("financeNoDataYet");
    }

    return ready;
}

function prepFinancials() {
    let ready = false;
    rawData = Player.annualReportData;
    if (Object.keys(rawData).length) {
        const theYearMenu = document.getElementById("menuFinancialYears");
        theYearMenu.innerHTML = makeYearMenu(rawData);
        if (!yearList.includes(year.toString())) year = yearList[yearList.length - 1];
        ready = true;
    }
    currentData = rawData[year];
    return ready;
}

function makeFinancialTableGuts() {
    let out = {
        guts : Localize.getString("tableHeadFinance"),
        notes : ""
    }

    const currency = Localize.getString("currency");
    //  first row is the starting balance
    const startingBalanceString = Math.round(currentData.startingBalance);
    out.guts += `<tr><td>${Localize.getString("startingBalance")}</td><td></td><td></td><td  class="moneyCell">${currency}${startingBalanceString}</td></tr>`;

    currentData.lineItems.forEach(lineItem => {
        const amountString = Math.round(lineItem.amount);
        const balanceString = Math.round(lineItem.balanceAfter);

        const incomeCell = lineItem.amount > 0 ? `<td class="moneyCell">${currency}${amountString}</td>` : `<td></td>`;
        const expenseCell = lineItem.amount < 0 ? `<td  class="moneyCell">${currency}${Math.abs(amountString)}</td>` : `<td></td>`;

        let reasonCellGuts;
        switch(lineItem.reason) {
            case "harvest":
                reasonCellGuts = Localize.getString("sellTreeNumber", lineItem.notes.treeNo);
                break;
            case "wages":
                reasonCellGuts = Localize.getString("harvestTreeNumber", lineItem.notes.treeNo);
                break;
            case "salary":
                reasonCellGuts = Localize.getString("salaryReason");
                break;
            default:
                reasonCellGuts = "Unknown reason!";
                break;
        }

        if (lineItem.notes.harvesters && lineItem.notes.harvesters.length > 1) {
            out.notes += Localize.getString("shareRevenue", lineItem.notes.treeNo, lineItem.notes.harvesters.length - 1) + "<br>";
        }

        out.guts += `<tr><td>${reasonCellGuts}</td>${incomeCell}${expenseCell}<td  class="moneyCell">${currency}${balanceString}</td></tr>`;
    })
    return out;
}

function makeYearMenu(data) {
    let options = "";
    yearList = [];
    for (const y in data) {
        yearList.push(y);
        const selected = (y === year) ? "selected" : "";
        options += `<option value="${y}" ${selected}>${y}</option>`;
    }
    return options;
}

export function onSelectYear() {
    const tYear = document.getElementById("menuFinancialYears").value;     //  string
    //  currentData = rawData[tYear];
    update(tYear);
}

export function numberToString(iValue, iFigs = 2) {
    let out;
    let multiplier = 1;
    let suffix = "";
    let exponential = false;

    if (iValue === "" || iValue === null || typeof iValue === "undefined") {
        out = "";
    } else if (iValue === 0) {
        out = "0";
    } else {
        if (Math.abs(iValue) > 1.0e15) {
            exponential = true;
        } else if (Math.abs(iValue) < 1.0e-4) {
            exponential = true;
        } else if (Math.abs(iValue) > 1.0e10) {
            multiplier = 1.0e9;
            iValue /= multiplier;
            suffix = " B";
        } else if (Math.abs(iValue) > 1.0e7) {
            multiplier = 1.0e6;
            iValue /= multiplier;
            suffix = " M";
        }
        out = new Intl.NumberFormat(
            God.theLang,
            {maximumSignificantDigits: iFigs, useGrouping: false}
        ).format(iValue);

        if (exponential) {
            out = Number.parseFloat(iValue).toExponential(iFigs);
        }
    }
    return `${out}${suffix}`;       //  empty if null or empty
}
