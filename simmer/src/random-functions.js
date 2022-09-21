const random_functions = {

    integer : function(iLower, iUpper) {
        if (iLower > iUpper) {
            const t = iUpper;
            iUpper = iLower;
            iLower = t
        }
        return Math.floor(iLower + (iUpper - iLower + 1) * Math.random());
    },

    pickFrom : function(iArray) {
        const N = iArray.length;
        return iArray[this.integer(0, N-1)];
    },
}