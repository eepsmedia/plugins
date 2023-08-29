let DG = {
    plugins : null,
};

let stringSources = {};

wweather.strings = {

    language : null,


    initialize: function () {
        //  const theLang = localizePlugin.figureOutLanguage('en');
        this.setLanguage('en');     //  use theLang
    },

    setLanguage: function (iLang) {
        //  this.attributeNameToEnglish = [];
        this.language = iLang;
        DG.plugins = stringSources[iLang];      //   so a string is DG.plugins.wweather....
        //  this.setStaticStrings();
        //  this.setupCODAPDataset();
    },

}