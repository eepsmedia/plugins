/**
 * Object containing parameters for all scenarios.
 * The `name` field is the same as the key, that's intentional.
 *
 * In the bulk of the code, we just look at the current scenario, which is `lottini.scenario`
 *
 * @type {{hunters: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {image: string, color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {image: string, color: string}, timeTillFade: number}, fbola: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {image: string, color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {image: string, color: string}, timeTillFade: number}, allowance_1: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {color: string}, timeTillFade: number}, allowance_2: {result: (function(*, *, *): *), emitData: boolean, rightDoorLook: {color: string}, left: number[], fadeTime: number, name: string, allowance: boolean, right: number[], leftDoorLook: {color: string}, timeTillFade: number}}}
 */
lottini.allScenarios = {

    'bears_AB': {
        name : "bears_AB",
        leftDoorLook : {color : 'dodgerblue', image : "images/gift-box-L.png"},
        rightDoorLook : {color : 'orange', image : "images/gift-box-R.png"},
        left : [2],
        right : [1, 1, 5],
        result: function (iSide, L, R) {
            return (iSide === 'left') ? pickRandomItemFrom(L) :pickRandomItemFrom(R) ;
        },
        image : {
            0 : "images/0-bears.png",
            1 : "images/1-bear.png",
            2 : "images/2-bears.png",
            5 : "images/5-bears.png",
        },
        timeTillFade: 1000,        //  in milliseconds
        fadeTime: 200,
        emitData: false,
        allowance : true,
    },

}

/**
 * Returns a random item from a list
 * @param a         the list
 * @returns {*}
 */
function pickRandomItemFrom(a) {
    const rrr = Math.random();
    const tL = a.length;
    const tR = Math.floor(rrr * tL);
    return a[tR];
}

