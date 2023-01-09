lotti.lotteries = {
    'basic': {
        name : "basic",
        leftDoorLook : {color : 'dodgerblue'},
        rightDoorLook : {color : 'orange'},
        left : [3],
        right : [7],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    },

    'standard': {
        name : "standard",
        leftDoorLook : {color : 'dodgerblue'},
        rightDoorLook : {color : 'orange'},
        left : [3],
        right : [0, 0, 0, 25],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    },

    'fbola' : {
        name : "fbola",
        leftDoorLook : {color : 'lightgreen', image : "images/yes-vax.png"},
        rightDoorLook : {color : 'pink',  image : "images/no-vax.png"},
        left : [1,2],
        right : [0, 0, 0, 0, 0, 0, 0, 20],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) : pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    },

    'hunters' : {
        name : "hunters",
        leftDoorLook : {color : 'lightgreen', 'image' : "images/viking-sven.png"},
        rightDoorLook : {color : 'pink', image : "images/viking-freya.png"},

        left : [1,2],
        right : [0, 0, 0, 0, 0, 0, 0, 20],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) : pickRandomItemFrom(R) ;
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
    }

}

/**
 * Returns a random item from a list
 * @param a         the list
 * @returns {*}
 */
function pickRandomItemFrom(a) {
    const rrr = Math.random();
    //  console.log(rrr);
    const tL = a.length;
    const tR = Math.floor(rrr * tL);
    return a[tR];
}

