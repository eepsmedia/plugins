/**
 * Created by tim on 8/19/16.


 ==========================================================================
 analysis.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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

/* global $, codapHelper, console, iframePhone, alert, TEEUtils, codapInterface, sendRequest */

/**
 * An "Analysis" is in charge of connecting an abstract analysis (a chart, a visualization)
 * to data contexts, collections, etc. in CODAP.
 * @constructor
 */
const Analysis = function ( ) {
    this.initialize();
};

Analysis.prototype.initialize = function () {
    this.collections = [];  // array of objects with { name : 'people', etc }
    this.topCollectionName = "";
    this.bottomCollectionName = "";

    this.cases = [];

};

Analysis.prototype.refreshDataOnly = function () {
    this.cases = [];
    this.getStructureAndData();

};


Analysis.prototype.getStructureAndData = async function () {
    await this.processDataContext();     //  includes getting list of attributes
    this.cases = await this.getCasesRecursivelyFromCollection(this.topCollectionName);
    console.log("Success reading in " + this.cases.length + " cases.");
};

Analysis.prototype.processDataContext = async function() {
    const tMessage = {
        action  : `get`,
        resource : `dataContext[${arbor.state.dataSetName}]`,
    }

    const tResult =  await codapInterface.sendRequest(tMessage);

    arbor.resetAttributeList();   //  set attsInBaum to []
    this.collections = tResult.values.collections;
    this.topCollectionName = this.collections[0].name;
    this.bottomCollectionName = this.collections[this.collections.length - 1].name;

    const excluded = [
        arbor.constants.diagnosisAttributeName,
        arbor.constants.sourceAttributeName,
        arbor.constants.analysisAttributeName,
        // todo: we don't have "health" here. Is that OK?
    ];

    for (c of this.collections) {
        for (a of c.attrs) {
            if (excluded.indexOf(a.name) < 0) {
                arbor.gotOneAttribute(a);
            }
        }
    }
};

Analysis.prototype.getCasesRecursivelyFromCollection = async function(iCollectionName) {
    let out = [];   //  this will hold the eventual cases
    //  get all case IDs for this collection

    const rGetCaseIDs = "dataContext[" + arbor.state.dataSetName + "].collection[" +
        iCollectionName + "].caseSearch[*]";
    const oCases = await codapInterface.sendRequest({action:"get", resource: rGetCaseIDs});

    for (const c of oCases.values) {
        out = out.concat(await this.getCasesWithChildrenRecursivelyByID(c.id));
    }
    return out;
};

/**
 *
 * @param iParentID     the CASE ID of the topmost case; calls itself to get children recursively
 * @returns {Promise<Array>} a flattened  array of case objects {id : 42, values : {height:6, weight:12...}}
 */
Analysis.prototype.getCasesWithChildrenRecursivelyByID = async function(iParentID) {
    let out = [];

    //  find all my children's IDs
    const rGetCaseByID = "dataContext[" + arbor.state.dataSetName + "].caseByID[" + iParentID + "]";
    const oParentCase = await codapInterface.sendRequest({action:"get", resource: rGetCaseByID});
    const parentValues = oParentCase.values.case.values;
    const kidIDArray = oParentCase.values.case.children;

    if (kidIDArray.length > 0) {

        //  loop over all children by ID
        for (const kID of kidIDArray) {
            const theChildren = await this.getCasesWithChildrenRecursivelyByID(kID);   //  array of all cases below
            for (const c of theChildren) {
                const tCaseValues = Object.assign({}, parentValues, c.values);
                out.push({id: kID, values: tCaseValues});
            }
        }
    } else {
        out = [{id : iParentID, values : parentValues}];
    }

    return out;
};



/**
 * Given that the structure exists, find the data in it.
 */
Analysis.prototype.getData = function () {

};


/*
    Making <options> lists for menus
 */

Analysis.prototype.makeOptionsList = function (iList) {
    let optionsClauses = "";
    iList.forEach(
        function (thing) {
            optionsClauses += "<option value='" + thing.name + "'>" +
                thing.title + "</option>";
        }
    );
    return optionsClauses;
};


