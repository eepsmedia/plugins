/**
 * In-plugin representation of a CODAP dataset.
 * Takes care of all dataset operations including communication with CODAP.
 *
 * Importantly, has a `structure` member that mimics the `values` field in a "get data context" call,
 * that is, it contains `collections`, each of which has an array of attributes.
 *
 * In addition, each collection has a `cases` field containing data.
 */
class CODAPDataset {

    structure = null;
    datasetName = null;

    constructor( iName ) {
        this.datasetName = iName;
    }

    /**
     * Scrambles the indicated attribute's values. Called from `scrambler.doScramble()`.
     *
     * This is typically called on the cloned dataset (titled "scrambled_whatever"),
     * after which the results (with computed measures) are collected
     *
     * Note that this attribute must be in the "last", most leafy collection.
     *
     * @param iAttName  the name of the attribute to be scrambled
     * @returns {Promise<void>}
     */
    async scrambleInPlace( iAttName ) {
        const nCollections = this.structure.collections.length;
        const lastCollection = this.structure.collections[nCollections - 1];

        const theCases = lastCollection.cases;
        let valueArray = [];        //  array that just holds the values of this attribute, one per case

        theCases.forEach( aCase => {
            valueArray.push(aCase.values[iAttName]);
        })

        valueArray.scramble();

        //  construct a request to CODAP to push these values into this dataset
        const theResource = `dataContext[${this.datasetName}].collection[${lastCollection.name}].case`;

        //  construct a "values" array (`theValues`) for an update.case message
        let theValues = [];

        for (let i = 0; i < valueArray.length; i++) {
            const thisCase = lastCollection.cases[i];
            const oneValuesObject = {};
            oneValuesObject[iAttName] = valueArray[i];
            theValues.push({
                id : thisCase.id,
                values : oneValuesObject,
            })
        }

        try {
            const updateScrambleResult = await codapInterface.sendRequest({
                action: "update",
                resource: theResource,
                values: theValues,
            });
        } catch (msg) {
            scrambler.doAlert("oops!", `Error updating a scramble! ${msg}`, "error");
        }
    }

    /**
     * Get values from the top n–1 collections of the `iSource` dataset.
     *
     * We do this by recursively looking into the collections' `cases`
     * and constructing _items_ for emission to CODAP.
     *
     * Called on the "scrambled" dataset.
     *
     * @param iSource  the source dataset, namely, the "cloned" dataset.
     */
    async makeMeasuresFrom(iSource) {
        await iSource.retrieveAllDataFromCODAP();

        const nCollections = iSource.structure.collections.length;
        const lastCollectionLevel = nCollections - 2;
        if (nCollections <= 1) {
            const theAlertText = `You're using ${nCollections} level(s) of collection. 
                You need at least two.
                Maybe you didn't press the refresh circle after changing the dataset?`;
            scrambler.doAlert("Watch out!", theAlertText);
            return null;
        }
        const theItems = iSource.scrapeCollections(0, lastCollectionLevel);
        return theItems;
    }

    scrapeCollections(iLevel, zLevel) {

        const thisCollection = this.structure.collections[iLevel];
        let theItems = [];

        thisCollection.cases.forEach( aCase => {
            const newData = this.dataFromCase(aCase, iLevel, zLevel);   //  an array of objects
            theItems = theItems.concat(newData);    //  put those items into the `theItems` array
        });

        return theItems;
    }

    dataFromCase(iCase, iLevel, zLevel) {
        if (iLevel === zLevel) {
            let leafValues = iCase.values;
            leafValues[scrambler.constants.iterationAttName] = scrambler.state.iteration;
            leafValues[scrambler.constants.scrambledAttAttName] = scrambler.state.scrambleAttributeName;
            return [leafValues];  //  array of a single object
        } else {
            let childrenData = [];
            iCase.children.forEach( childID => {
                const theChildCase = this.findCaseAtLevel(childID, iLevel + 1);
                const dataFromBelow = this.dataFromCase(theChildCase, iLevel + 1, zLevel);
                //  const thisData = dataFromBelow.concat(iCase.values);

                //  dataFromBelow is an array of sets of data.
                dataFromBelow.forEach( oneDataObject => {
                    const thisData = Object.assign(oneDataObject, iCase.values);
                    childrenData.push(thisData);
                })
            })
            return childrenData;
        }

    }

    findCaseAtLevel(iCaseID, iLevel) {
        const theCollection = this.structure.collections[iLevel];
        const theCase = theCollection.cases.find( aCase => aCase.id === iCaseID);
        return theCase;
    }

    async emitItems(iAppend, iValues) {
        //  todo: use iAppend
        const newItemsMessage = {
            action : "create",
            resource : `dataContext[${this.datasetName}].item`,
            values : iValues,
        }

        try {
            const newScrambledItemsResult = await codapInterface.sendRequest(newItemsMessage);
        } catch (msg) {
            scrambler.doAlert("Hmmm.", `Problem emitting scrambled measures from ${this.datasetName}: ${msg}`)
        }
    }

    /**
     * Ask CODAP for all cases in all collections, calling `getAllCasesInCollection()`
     *
     * @returns {Promise<void>}
     */
    async retrieveAllDataFromCODAP() {
        await this.loadStructureFromCODAP();

        const thePromises = [];

        try {
            this.structure.collections.forEach(coll => {
                try {
                    thePromises.push(this.getAllCasesInCollection(coll));
                } catch (msg) {
                    console.log(`trouble getting all cases in "${coll}: ${msg}`);
                }
            })
        } catch(msg) {
            scrambler.doAlert("Dang!", `No structure: ${msg}`, "error");
        }

        await Promise.all(thePromises);
    }

    async loadStructureFromCODAP() {
        if (this.datasetName) {
            const theMessage = {
                action: "get",
                resource: `dataContext[${this.datasetName}],`
            }
            const getDatasetResult = await codapInterface.sendRequest(theMessage);
            this.structure = getDatasetResult.values;

        } else {
            scrambler.doAlert("Dang!", "Can't load a structure without a dataset name", "error");
        }
    }

     async  getAllCasesInCollection(iCollection) {
        const tMessage = {
            action : "get",
            resource: `dataContext[${this.datasetName}].collection[${iCollection.name}].caseCount`,
        }

        const theCountResult = await codapInterface.sendRequest(tMessage);

        const theRequests  = [];

        for (let i = 0; i < theCountResult.values; i++ ) {
            const cMessage = {
                action : "get",
                resource : `dataContext[${this.datasetName}].collection[${iCollection.name}].caseByIndex[${i}]`,
            }
            theRequests.push(cMessage);
        }

        const theCaseResults = await codapInterface.sendRequest(theRequests);
        //  this is an array of results; we check each one to see if it's a success.
        //  if any fail, we declare this a failure...

        const theCases = [];
        let casesAreOK = true;

        for (let i=0; i < theCountResult.values; i++) {
            if (theCaseResults[i].success) {
                theCases.push(theCaseResults[i].values.case);
            } else {
                casesAreOK = false;
            }
        }

        if (casesAreOK) {
            iCollection.cases = theCases;
        } else {
            scrambler.doAlert("Dang!", `Error getting cases from collection [${iCollection.name}]`, "error");
        }

       // return theCaseResults;
    }

    async emitDatasetStructureOnly() {
            await codapInterface.sendRequest({
                action: "delete",
                resource : `dataContext[${this.datasetName}]`,
            })

            //  okay, now make a new one...

            const theCollections = [];
            for (let i = 0; i < this.structure.collections.length; i++) {

                const inputColl = this.structure.collections[i];
                const parentColl = i > 0 ? this.structure.collections[i-1] : null;
                const theAttrs = [];
                inputColl.attrs.forEach( attr => {
                    const thisAttr = Object.assign({},attr);
                    //  now get rid of the (old dataset's) ids!
                    delete thisAttr.id;
                    delete thisAttr.guid;
                    delete thisAttr.cid;
                    theAttrs.push(thisAttr);
                })
                const outputColl = {
                    name : inputColl.name,
                    title : inputColl.title,
                    attrs : theAttrs,
                }

                //  fix the parent to be the (string) value of the parent collection's name
                if (parentColl) {
                    outputColl.parent = parentColl.name;
                }

                theCollections.push(outputColl);
            }

            const theValues = {
                name : this.datasetName,
                title : this.datasetName,
                collections : theCollections,
            }

            await codapInterface.sendRequest({
                action: "create",
                resource : `dataContext`,
                values : theValues,
            })

    }

    async emitCasesFromDataset() {

        let theNextDictionary = null;

        for (let i=0; i < this.structure.collections.length; i++) {
            const theCollection = this.structure.collections[i];
            theNextDictionary = await this.emitCasesFromCollection(theCollection, theNextDictionary);
        }
    }

    async emitCasesFromCollection(iColl, parentDictionary) {
        const theResource = `dataContext[${this.datasetName}].collection[${iColl.name}].case`;
        const theValues = [];       //  array of key/value pairs
        const theOldIDs = [];

        for (let i = 0; i < iColl.cases.length; i++) {
            const internalCaseData = iColl.cases[i];
            const outputCase = {};
            outputCase["values"] = Object.assign({}, internalCaseData.values);
            if (internalCaseData.parent) {
                const theParentID = parentDictionary[internalCaseData.parent]
                outputCase["parent"] = theParentID;
                internalCaseData.parent = theParentID;
            }
            theValues.push(outputCase);

            theOldIDs[i] = internalCaseData.id;    //  for the dictionary, to be returned
        }

        const theMessage = {
            action : "create",
            resource : theResource,
            values : theValues,
        }

        const theCreateCasesResults = await codapInterface.sendRequest(theMessage);
        const theIDDictionary = {};

        for (let i = 0; i < theCreateCasesResults.values.length; i++) {
            theIDDictionary[theOldIDs[i]] = theCreateCasesResults.values[i].id;
            iColl.cases[i].id = theCreateCasesResults.values[i].id;
        }

        return theIDDictionary;
    }

    toString() {
        let out = `${this.structure.title} • `;
        out += `${this.structure.collections.length} collection(s)`;
        return out;
    }

    /**
     * Clones the "this" dataset,
     * including the `cases` field in the `collections` if it has been filled
     *
     * Also ensures that the top collection has _no_ `parent` property
     *
     * @returns {CODAPDataset}
     */
    clone(iPrefix) {
        const theNewName = `${iPrefix}${this.datasetName}`
        let out = new CODAPDataset(theNewName);

        let newCollections = [];
        this.structure.collections.forEach( oneCollection => {
            newCollections.push(Object.assign({}, oneCollection));
        })

        out.structure = {
            name : theNewName,
            title : theNewName,
            collections : newCollections,
        }

        delete out.structure.collections[0].parent;

        return out;
    }


    makeIntoMeasuresDataset() {
        //  get rid of "leaf" collection
        this.structure.collections.pop();

        //  get rid of any formulas
        this.structure.collections.forEach(aCollection => {
            aCollection.attrs.forEach( attr => {
                if (attr.formula) {
                    delete attr.formula;
                }
            })
        })

        const scritCollection = {
            name : "iterations",
            attrs : [{
                name : scrambler.constants.iterationAttName,
                type : "categorical",
                description : `Which "run" of data. Increases every time you scramble.`,
            },{
                name : scrambler.constants.scrambledAttAttName,
                type : "categorical",
                description : `Which attribute was scrambled.`,
            }],
        }

        this.structure.collections.splice(0, 0, scritCollection);
    }

    findSelectedAttribute(iSuggestion) {
        const lastCollection = this.structure.collections[this.structure.collections.length-1];
        let found = false;
        lastCollection.attrs.forEach( attr => {
            if (attr.name === iSuggestion) {
                found = true;
            }
        })
        return (found ? iSuggestion : lastCollection.attrs[0].name);
    }

    makeAttributeMenuGuts( iSuggestion ) {
        const theSelectedOne = this.findSelectedAttribute(iSuggestion)
        const nColls = this.structure.collections.length;
        const lastCollection = this.structure.collections[nColls-1];

        let out = "";
        lastCollection.attrs.forEach( attr => {
            let selectedText = (theSelectedOne === attr.name) ? "selected" : "";
            out += `<option value="${attr.name}" ${selectedText}>${attr.name}</option>`;
        })
        // out = `<select id="attributeMenu">${out}</select>`;

        return out;

    }

}