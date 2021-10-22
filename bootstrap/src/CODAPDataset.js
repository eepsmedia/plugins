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

    constructor(iName) {
        this.datasetName = iName;
    }

    /**
     * Get the structure of this dataset from CODAP and store it in `this.structure`.
     * We use this for everything, including storing the data.
     *
     * Called from `retrieveAllDataFromCODAP()`
     *
     * @returns {Promise<void>}
     */
    async loadStructureFromCODAP() {
        if (this.datasetName) {
            const theMessage = {
                action: "get",
                resource: `dataContext[${this.datasetName}],`
            }
            const getDatasetResult = await codapInterface.sendRequest(theMessage);
            this.structure = getDatasetResult.values;
        } else {
            bootstrap.doAlert("Dang!", "Can't load a structure without a dataset name", "error");
        }
    }

    possibleBootstrapAttributeNames(iCheck) {
        const lastCollection = this.structure.collections[this.structure.collections.length - 1];
        let formula = false;

        let out = [];
        lastCollection.attrs.forEach(attr => {
            if (!attr.formula) {    //  can't bootstrap a formula attribute....
                out.push(attr.name);
            } else if (attr.name === iCheck) {  //  has a formula AND it's the one we're checking
                formula = true;
            }
        })

        return {
            array: out,
            check: out.includes(iCheck),
            hasFormula: formula,
        };
    }

    allAttributeNames() {
        let out = [];
        this.structure.collections.forEach((c) => {
            c.attrs.forEach((a) => {
                out.push(a.name);
            })
        })
        return out;
    }


    /**
     * Called from `bootstrap.doBootstrap()`.
     *
     * This is typically called on the cloned dataset (titled "bootstrapped_whatever"),
     * after which the results (with computed measures) are collected
     *
     * @param iSource  the CODAPDataset being bootstrapped (the original data)
     * @returns {Promise<void>}
     */
    async bootstrapCasesFrom(iSource) {
        const nCollections = iSource.structure.collections.length;
        const lastCollection = iSource.structure.collections[nCollections - 1];
        const theLastCases = lastCollection.cases;

        const nCases = theLastCases.length;

        await connect.emptyCODAPDataset(this);     //  start empty

        //  construct a request to CODAP to push these values into this dataset
        const theResource = `dataContext[${this.datasetName}].item`;

        //  construct a "values" array (`theValues`) for an update.case message
        let theValues = [];

        //  make Values array, one for each case in the bootstrapped dataset.
        for (let i = 0; i < nCases; i++) {
            const randomIndex = Math.floor(Math.random() * nCases);
            const randomCaseFromSource = lastCollection.cases[randomIndex];
            //  console.log(`        boot ${i} index ${randomIndex}: ${randomCaseFromSource.values.name}`);
            theValues.push({
                values: randomCaseFromSource.values,
            })
        }

        try {
            const emitBootstrapSampleResult = await codapInterface.sendRequest({
                action: "create",
                resource: theResource,
                values: theValues,
            });
            console.log(`    done with a bootstrap (${theValues.length}), success? ${emitBootstrapSampleResult.success}`);
        } catch (msg) {
            bootstrap.doAlert("oops!", `Error updating a bootstrap! ${msg}`, "error");
        }
    }

    /**
     * Get values from the top n–1 collections of the `iSource` dataset.
     *
     * We do this by recursively looking into the collections' `cases`
     * and constructing _items_ for emission to CODAP.
     *
     * Called on the "bootstrapped" dataset.
     *
     * @param iSource  a `CODAPDataset`. The source dataset, specifically, the "bootstrapped" dataset.
     * @returns theItems    an array of objects suitable for export to CODAP as items
     */
    async makeMeasuresFrom(iSource) {
        await iSource.retrieveAllDataFromCODAP();

        const nCollections = iSource.structure.collections.length;
        const lastCollectionLevel = nCollections - 2;   //   so if there are 3 levels, this is 1, that is, the second level.
        if (nCollections <= 1) {
            const theAlertText = `You're using ${nCollections} level(s) of collection. 
                You need at least two.
                Make a measure and drag it leftwards!`;
            bootstrap.doAlert("Watch out!", theAlertText);
            return null;
        }
        const theItems = iSource.scrapeCollections(0, lastCollectionLevel);
        return theItems;
    }

    /**
     * The beginning of a recursive dance to get items from collections.
     * We start with the highest-level collection (this is called with `iLevel == 0`),
     * and find all its cases.
     *
     * Then, for each case at this top level,
     * we call `dataFromCase()` (where the recursion really happens) to get
     * an array of all the items that contain this case's data
     * plus the data of all its children.
     *
     * @param iLevel    the level we're starting at (should be 0)
     * @param zLevel    the bottom level we're collecting from (one above the "leaf" level)
     * @returns {*[]}   array of items
     */
    scrapeCollections(iLevel, zLevel) {

        const thisCollection = this.structure.collections[iLevel];
        let theItems = [];

        thisCollection.cases.forEach(aCase => {
            const newData = this.dataFromCase(aCase, iLevel, zLevel);   //  an array of objects
            theItems = theItems.concat(newData);    //  put those items into the `theItems` array
        });

        return theItems;
    }

    /**
     * The recursive heart of getting data from nested collections.
     *
     * @param iCase     the (CODAP) case object we're getting data from
     * @param iLevel    what level of the hierarchy we're in
     * @param zLevel    the bottom level we're digging towards
     * @returns {*[]}   an array of objects, each of which is the `{att: val, …}` data for the case and its children
     */
    dataFromCase(iCase, iLevel, zLevel) {
        if (iLevel === zLevel) {
            let leafValues = iCase.values;  //  an object containing attribute names and values as returned by CODAP

            //  now we add two more attributes, one for the iteration and one for the bootstrapped attribute name
            leafValues[bootstrap.strings.sIterationAttName] = bootstrap.state.iteration;
            leafValues[bootstrap.strings.sBootstrapdAttName] = bootstrap.state.bootstrapAttributeName;

            //  end recursion here.
            return [leafValues];  //  array of a single object
        } else {
            //  recursion continues...

            let childrenData = [];  //  this will be an array of `{att: val, …}` (data) objects for all our children

            //  loop over the `children` array, which contains `caseID`s.
            iCase.children.forEach(childID => {
                const theChildCase = this.findCaseAtLevel(childID, iLevel + 1); //  get that case
                const dataFromBelow = this.dataFromCase(theChildCase, iLevel + 1, zLevel);  //  recurse!

                //  dataFromBelow is an array of sets of data.
                dataFromBelow.forEach(oneDataObject => {
                    //  make a case-data object consisting of what we just retrieved plus the data from THIS case.
                    const thisData = Object.assign(oneDataObject, iCase.values);
                    childrenData.push(thisData);    //  stick it in the array.
                })
            })
            return childrenData;
        }
    }

    /**
     * Get the case information (which includes the ID; `values`,
     * which is the data; and `children` which is the child IDs).
     *
     * We use the data stored in `this.structure`. No need to go back to CODAP.
     *
     * @param iCaseID   the caseID of the one we seek
     * @param iLevel    the level, which tells us which collection to look for it in
     * @returns {*}     the found case itself
     */
    findCaseAtLevel(iCaseID, iLevel) {
        const theCollection = this.structure.collections[iLevel];
        const theCase = theCollection.cases.find(aCase => aCase.id === iCaseID);
        return theCase;
    }


    /**
     * Ask CODAP for all cases in all collections, calling `getAllCasesInCollection()`.
     * The data get stored in the `structure` member.
     *
     * @returns {Promise<void>}
     */
    async retrieveAllDataFromCODAP() {
        await this.loadStructureFromCODAP();    //  now `this.structure` is set

        const thePromises = [];

        try {
            this.structure.collections.forEach(coll => {
                try {
                    thePromises.push(this.getAllCasesInCollection(coll));
                } catch (msg) {
                    console.log(`trouble getting all cases in "${coll}: ${msg}`);
                }
            })
        } catch (msg) {
            bootstrap.doAlert("Dang!", `No structure: ${msg}`, "error");
        }

        await Promise.all(thePromises);     //  await the data from all collections
    }


    /**
     * Retrieve all case data from the collection and stuff it into the collection's (new) `cases` member.
     *
     *  Called from `retrieveAllDataFromCODAP()`
     *
     * @param iCollection   a collection from the `structure.collections` array.
     * @returns {Promise<void>}
     */
    async getAllCasesInCollection(iCollection) {
        // first, figure out how many cases there are
        //  this is so we can make a loop for getting the cases
        const tMessage = {
            action: "get",
            resource: `dataContext[${this.datasetName}].collection[${iCollection.name}].caseCount`,
        }

        const theCountResult = await codapInterface.sendRequest(tMessage);

        //  set up for an array of requests, one per case (we'll do them by index)
        const theRequests = [];

        for (let i = 0; i < theCountResult.values; i++) {
            const cMessage = {
                action: "get",
                resource: `dataContext[${this.datasetName}].collection[${iCollection.name}].caseByIndex[${i}]`,
            }
            theRequests.push(cMessage);     //  add to the array of requests
        }

        const theCaseResults = await codapInterface.sendRequest(theRequests);
        //  this is an array of results; we check each one to see if it's a success.
        //  if any fail, we declare this a failure...

        const theCases = [];
        let casesAreOK = true;

        for (let i = 0; i < theCountResult.values; i++) {
            if (theCaseResults[i].success) {
                theCases.push(theCaseResults[i].values.case);
            } else {
                casesAreOK = false;
            }
        }

        if (casesAreOK) {
            //  recall that `iCollection` is a collection in the `structure.collections` array.
            iCollection.cases = theCases;   //  here is where the case data gets stored into the `structure` member.
        } else {
            bootstrap.doAlert("Dang!", `Error getting cases from collection [${iCollection.name}]`, "error");
        }
    }

    /**
     * Have CODAP make a dataset without any data, based on the structure of `this`.
     *
     * Called by `makeNewMeasuresDataset()` and `makeNewBootstrappedDataset()`
     *
     * @returns {Promise<void>}
     */
    async emitDatasetStructureOnly() {

        //  Does it already exist? Delete it.
        await codapInterface.sendRequest({
            action: "delete",
            resource: `dataContext[${this.datasetName}]`,
        })

        //  okay, now make a new one...
        //  we'll loop over the collections and use their info to build the request

        const theCollections = [];
        for (let collectionLevel = 0; collectionLevel < this.structure.collections.length; collectionLevel++) {

            const inputColl = this.structure.collections[collectionLevel];

            //  identify the parent, if any (we'll need its name)
            const parentColl = collectionLevel > 0 ? this.structure.collections[collectionLevel - 1] : null;
            const theAttrs = [];

            //  each collection contains info on its attributes.
            inputColl.attrs.forEach(attr => {
                const thisAttr = Object.assign({}, attr);
                //  now get rid of the (old dataset's) ids!
                delete thisAttr.id;
                delete thisAttr.guid;
                delete thisAttr.cid;
                theAttrs.push(thisAttr);
            })

            //  now we make `outputColl`, which is what we'll send to CODAP...
            const outputColl = {
                name: inputColl.name,
                title: inputColl.title,
                attrs: theAttrs,
            }

            //  fix the parent to be the (string) value of the parent collection's name
            if (parentColl) {
                outputColl.parent = parentColl.name;
            }

            //  put what we have built into the array ...
            theCollections.push(outputColl);
        }

        const theValues = {
            name: this.datasetName,
            title: this.datasetName,
            collections: theCollections,    //  ... which is what we send to CODAP
        }

        //  finally, send the request
        await codapInterface.sendRequest({
            action: "create",
            resource: `dataContext`,
            values: theValues,
        })

    }

    async emitItems(iAppend, iValues) {
        //  todo: use iAppend
        const newItemsMessage = {
            action: "create",
            resource: `dataContext[${this.datasetName}].item`,
            values: iValues,
        }

        try {
            const newBootstrappedItemsResult = await codapInterface.sendRequest(newItemsMessage);
        } catch (msg) {
            bootstrap.doAlert("Hmmm.", `Problem emitting bootstrapped measures from ${this.datasetName}: ${msg}`)
        }
    }

    async emitCasesFromDataset() {

        let theNextDictionary = null;

        for (let i = 0; i < this.structure.collections.length; i++) {
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
            action: "create",
            resource: theResource,
            values: theValues,
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

        const theNewName = this.structure.title ?
            `${iPrefix}${this.structure.title}` :
            `${iPrefix}${this.datasetName}`;

        let out = new CODAPDataset(theNewName);

        let newCollections = [];
        this.structure.collections.forEach(oneCollection => {
            newCollections.push(Object.assign({}, oneCollection));
        })

        out.structure = {
            name: theNewName,
            title: theNewName,
            collections: newCollections,
        }

        delete out.structure.collections[0].parent;

        return out;
    }


    makeIntoMeasuresDataset() {

        //  define the top-level "iterations" collection

        const bootCollection = {
            name: "iterations",
            attrs: [{
                name: bootstrap.strings.sIterationAttName,
                type: "categorical",
                description: bootstrap.strings.sIterationAttDescription,
            },
            ],
        }

        //  define the other collection (which will contain all non-leaf attributes)
        //  we will add them in shortly

        const measuresCollection = {
            name: "measures",
            attrs: [],
        }

        //  get rid of "leaf" collection
        this.structure.collections.pop();

        //  get rid of any formulas
        this.structure.collections.forEach(aCollection => {
            aCollection.attrs.forEach(attr => {
                if (attr.formula) {
                    attr.deletedFormula = attr.formula;
                    delete attr.formula;
                }
                measuresCollection.attrs.push(attr);
            })
        })

        //  make the new structure

        this.structure = {
            collections: [bootCollection, measuresCollection],
            name: this.structure.name,
            title: this.structure.title,
        };
    }

}