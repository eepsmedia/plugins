lotti.lotteries = {
    'basic': {
        name : "basic",
        left : [3],
        right : [7],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        resultUnit: '€',
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    },

    'standard': {
        name : "standard",
        left : [3],
        right : [0, 0, 0, 25],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        resultUnit: '€',
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    },

}

/**
 * Returns a random item from a list
 * @param a         the list
 * @returns {*}
 */
function pickRandomItemFrom(a) {
    const rrr = Math.random();
    console.log(rrr);
    const tL = a.length;
    const tR = Math.floor(rrr * tL);
    return a[tR];
}

