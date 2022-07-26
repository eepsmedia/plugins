/*
 ==========================================================================
 TEEUtils.js

 Collection of utility functions before they get merged into common.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================
 */
/**
 * Created by tim on 10/20/15.
 */


const TEEUtils = {

        pluralize: function (iSingular = "noun", iArticle = "") {
            const specialNouns = [
                "fish", "deer", "series", "offspring", "sheep", "bison", "cod",
            ]

            let thePlural = iSingular;
            const theLength = thePlural.length;
            const lower = iSingular.toLocaleLowerCase();

            if (!specialNouns.includes(lower)) {
                const lastOne = lower.slice(-1);
                const lastTwo = lower.slice(-2);

                if (lower.slice(-5) === "craft") {
                    thePlural = iSingular;
                } else if (thePlural === "man") {
                    thePlural = "men";
                } else if (thePlural === 'woman') {
                    thePlural = 'women';
                } else if (thePlural === 'child') {
                    thePlural = 'children';
                } else if (thePlural === 'radius') {
                    thePlural = 'radii';
                } else if (thePlural === 'die') {
                    thePlural = 'dice';
                    /*
                                } else if (lastTwo === 'um') {
                                    thePlural = thePlural.slice(0, theLength - 2) + "a";
                                } else if (lastTwo === 'us') {
                                    thePlural = thePlural.slice(0,theLength-2) + "i";
                    */
                } else if (lastTwo === 'zz') {
                    thePlural = thePlural + "es";
                } else if (lastOne === 's') {
                    thePlural = thePlural + "es";
                } else if (lastOne === 'z') {
                    thePlural = thePlural + "zes";
                } else if (lastOne === 'y' &&
                    lastTwo === 'ly' || lastTwo === 'ty' || lastTwo === 'dy' || lastTwo === 'cy' ||
                    lastTwo === 'fy' || lastTwo === 'gy' || lastTwo === 'zy' || lastTwo === 'ry' ||
                    lastTwo === 'my' || lastTwo === 'ny' || lastTwo === 'py' || lastTwo === 'sy') {
                    thePlural = thePlural.slice(0, theLength - 1) + "ies";
                } else {
                    thePlural = thePlural + "s";
                }
            }

            return thePlural;
        },


        getListOfOneFieldInArrayOfObjects:

            function (iList, what) {
                let out = [];
                iList.forEach(function (o) {
                    out.push(o[what]);
                });
                return out;
            }

        ,

        /**
         * Are any of the elements of a1 in a2?
         *
         * @param a1    one array
         * @param a2    the other array
         * @returns {boolean}   true or false
         */
        anyInAny: function (a1, a2) {
            let out = false;
            a1.forEach(function (e) {
                if (a2.indexOf(e) >= 0) {
                    out = true;
                }
            });
            return out;
        }
        ,


        padIntegerToTwo: function (i) {
            if (i === 0) return "00";
            if (i >= 10) return "" + i;
            else return "0" + i;
        },

        twoPlaces: function (x) {
            return (Math.round(x * 100) / 100.0);
        },

        stringFractionDecimalOrPercentToNumber: function (iString) {
            let out = {theNumber: 0, theString: '0'};
            let theNumber = 0;
            let theString = "";

            const wherePercent = iString.indexOf("%");
            const whereSlash = iString.indexOf("/");
            if (wherePercent !== -1) {
                theNumber = parseFloat(iString.substring(0, wherePercent - 1)) / 100.0;
                theString = `${theNumber}%`;
            } else if (whereSlash !== -1) {
                const beforeSlash = iString.substring(0, whereSlash - 1);
                const afterSlash = iString.substring(whereSlash + 1);
                const theNumerator = parseFloat(beforeSlash);
                const theDenominator = parseFloat(afterSlash);
                theNumber = theNumerator / theDenominator;
                theString = `${theNumerator}/${theDenominator}`;
            } else {
                const theNumber = parseFloat(iString);
                theString = `${theNumber}`;
            }

            if (!isNaN(theNumber)) {
                return {theNumber: theNumber, theString: theString};
            } else {
                return {theNumber: 0, theString: ""};
            }
        },


        /**
         * A funky random Poisson function.
         * Use Knuth algorithm up to n = 100; normal approximation beyond that.
         * @param mean
         * @returns {number}
         */
        randomPoisson: function (mean) {

            if (mean > 100) {
                const sd = Math.sqrt(mean);
                return Math.round(TEEUtils.randomNormal(mean, sd));   //  todo: use randomNormal from common
            }
            const L = Math.exp(-mean);
            let p = 1.0;
            let k = 0;
            do {
                k++;
                p *= Math.random();
            } while (p > L);
            return (k - 1);
        }
        ,

        /**
         * returns a value for the Normal distribution at a particular point
         * @param x         the x-value
         * @param mean      mean of the N
         * @param sd        standard deviation parameter
         */
        normal: function (x, mean, sd) {
            const tDenom = Math.sqrt(2 * sd * sd * Math.PI);
            const tExponent = -(x - mean) * (x - mean) / 2 / sd / sd;

            return Math.exp(tExponent) / tDenom;
        }
        ,

        /**
         * Random normal, Box-Muller transform. Use only one value.
         * @param mean
         * @param sd
         * @returns {*}
         */
        randomNormal: function (mean, sd) {
            const t1 = Math.random();
            const t2 = Math.random();

            const tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI * t2);

            return mean + sd * tZ;
        }
        ,

        /**
         * Returns a random item from a list
         * @param a         the list
         * @returns {*}
         */
        pickRandomItemFrom: function (a) {
            const tL = a.length;
            const tR = Math.floor(Math.random() * tL);
            return a[tR];
        }
        ,

        dateStringToDOY: function (iString) {
            const dateArray = iString.split("-");
            const dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            const mn = Number(dateArray[1]);
            const dn = Number(dateArray[2]);
            const yn = Number(dateArray[0]);
            const leapThing = yn % 4 === 0 ? 1 : 0;

            let dayOfYear = dayCount[mn - 1] + dn;
            if (mn > 1) dayOfYear += leapThing;
            return dayOfYear;
        },

        dateStringToDayOfWeek: function (iString, iTimeZoneString) {
            const tTempDate = new Date(iString + " " + iTimeZoneString);
            const tDay = tTempDate.getDay();      //  day of week, Sunday = 0, etc.
            return tDay;
        },

        dateNumberToDayOfWeek: function (iMilliseconds) {
            const tTempDate = new Date(iMilliseconds);
            const tDay = tTempDate.getDay();      //  day of week, Sunday = 0, etc.
            return tDay;
        },

        newtonsMethod: function (iExpression, iStartValue, iTolerance) {
            const maxIterations = 50;
            let nIterations = 0;
            let xCurrentValue = iStartValue;
            const delta = iTolerance;   //  using iTolerance for delta x. Good idea??

            let x = xCurrentValue;
            let yCurrentValue = eval(iExpression);

            console.log("    ....newton find root of f(x) = " + iExpression);
            console.log("    ....newton start at x = " + iStartValue + " f(x) = " + yCurrentValue);
            while (Math.abs(yCurrentValue) > iTolerance && nIterations < maxIterations) {
                nIterations += 1;
                x = xCurrentValue + delta;
                const yAtXPlusDelta = eval(iExpression);
                const fPrime = (yAtXPlusDelta - yCurrentValue) / delta;

                if (fPrime !== 0) {
                    const d = -yCurrentValue / fPrime;
                    xCurrentValue += d;
                } else {
                    xCurrentValue -= delta;     //  kludge in case we're at a peak :)
                }
                x = xCurrentValue;
                yCurrentValue = eval(iExpression);
                console.log("    ....newton " + nIterations + " f(" + x + ") = " + yCurrentValue);
            }
            console.log("    ....newton solution x = " + x);

            return {success: (nIterations < maxIterations), x: xCurrentValue, y: yCurrentValue, iterations: nIterations};
        }
        ,

        /**
         * Assumes a flat earth, where difference in longitude is scaled to the cosine of the latitude.
         * That is, we do NOT go to the trouble of a great-circle calculation.
         *
         * @param lat1
         * @param long1
         * @param lat2
         * @param long2
         * @returns {number}    distance in km
         */
        earthDistanceNoGreatCircle: function (lat1, long1, lat2, long2) {
            R = 40000.00 / 2.0 / Math.PI;       //  radius in km

            const dLat = R * (lat2 - lat1) * Math.PI / 180.0;
            const cosLat = Math.cos((lat2 + lat1) * Path.PI / 180.0 / 2.0);  //  cosine of average latitude
            const dLong = R * cosLat * (long2 - long1) * Math.PI / 180.0;

            return Math.sqrt(dLat * dLat + dLong * dLong);  //  distance in kilometers
        }
        ,

        zeroPad: function (num, numZeros) {
            const n = Math.abs(num);
            const zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
            let zeroString = Math.pow(10, zeros).toString().substr(1);
            if (num < 0) {
                zeroString = '-' + zeroString;
            }

            return zeroString + n;
        }


    }
;

Number.prototype.newFixed = function (nPlaces) {

    const posSuffix = {
        0: "", 1: "", 2: "", 3: "", 4: "k", 5: "k", 6: "M",
        7: "M", 8: "M", 9: "B", 10: "B", 11: "B", 12: "T"
    };
    const negSuffix = {
        1: "", 2: "", 3: "/k", 4: "/M", 5: "/M", 6: "/M",
        7: "/M", 8: "/M", 9: "/B", 10: "/B", 11: "/B", 12: "/T"
    };
    const factors = {
        "/T": 1.0e12, "/B": 1.0e9, "/M": 1.0e6, "/k": 1.0e3, "": 1.0,
        "k": 1.0e-3, "M": 1.0e-6, "B": 1.0e-9, "T": 1.0e-12
    };

    let theLog = Math.floor(Math.log10(Math.abs(this)));

    if (theLog < -14) {     //  is the number really close to zero? Then use zero.
        return this.toFixed(nPlaces);
    }

    const isNegative = (this < 0);
    const negativeLog = (theLog < 0);
    theLog = Math.abs(theLog);
    if (theLog > 12) {
        theLog = 12;
    }
    const theSign = isNegative ? "-" : "";
    const theSuffix = negativeLog ? negSuffix[theLog] : posSuffix[theLog];
    const theFactor = factors[theSuffix];
    const out = (Math.abs(this) * theFactor);
    //  console.log('-----------in newFixed with ' + this + " theLog = " + theLog);

    let theNumberString = out.toFixed(nPlaces);
    const theIntegerString = out.toFixed(0);
    let newPlaces = nPlaces - theIntegerString.length;
    if (newPlaces < 0) newPlaces = 0;

    theNumberString = out.toFixed(newPlaces);

    return (theSign + theNumberString + theSuffix);
};

//  Thanks, stackOverflow!


Date.prototype.CODAPDateTimeString = function () {
    const yyyy = TEEUtils.padIntegerToTwo(this.getFullYear().toString());
    const mm = TEEUtils.zeroPad(this.getMonth() + 1, 2);    // getMonth() is zero-based
    const dd = TEEUtils.zeroPad(this.getDate(), 2);

    const hh = TEEUtils.zeroPad(this.getHours(), 2);
    const min = TEEUtils.zeroPad(this.getMinutes(), 2);
    const sec = TEEUtils.zeroPad(this.getSeconds(), 2);
    const ddd = TEEUtils.zeroPad(this.getMilliseconds(), 3);

    return mm + "/" + dd + "/" + yyyy + " " + hh + ":" + min + ":" + sec + "." + ddd;
};

Date.prototype.ISO_8601_string = function () {
    const yyyy = this.getFullYear().toString();
    const mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    const dd = this.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
};

Date.prototype.BART_string = function () {
    const hh = this.getHours().toString();
    const ii = this.getMinutes().toString();

    return this.ISO_8601_string() + " " + (hh[1] ? hh : "0" + hh[0]) + ":" + (ii[1] ? ii : "0" + ii[0]);
};

Date.prototype.isLeapYear = function () {
    const year = this.getFullYear();
    if ((year & 3) !== 0) return false;
    return ((year % 100) !== 0 || (year % 400) === 0);
};
