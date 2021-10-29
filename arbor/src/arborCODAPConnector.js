/**
 * Created by tim on 1/7/16.
 */

/**
 * A  manager class responsible for communicating with the CODAP environment
 * @constructor
 */
arbor.codapConnector = {
    gameCaseID: 0,
    gameNumber: 0,

    /**
     * Does the named dataset already exist?
     * @param iName
     * @returns {Promise<void>}
     */
    datasetExists: async function (iName) {
        let out = false;

        const existMessage = {
            action: "get",
            resource: `dataContextList`,
        }
        const tListResult = await codapInterface.sendRequest(existMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                if (ds.name === iName) {
                    out = true;
                }
            })
        }
        return out;
    },

    /**
     * Emit a "tree" case.
     * @param iValues   the case values
     */
    createClassificationTreeItem: function (iValues) {
        pluginHelper.createItems(
            iValues,
            arbor.constants.kClassTreeDataSetName,
        ); // no callback.
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": arbor.constants.kClassTreeDataSetName,
            }
        })
    },

    createRegressionTreeItem : function(iValues ) {
        pluginHelper.createItems(
            iValues,
            arbor.constants.kRegressTreeDataSetName,
        );
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": arbor.constants.kRegressTreeDataSetName,
            }
        })

    },

    /**
     * Object needed by codapHelper to initialize a dataset
     * @type {{name: string, title: string, description: string, collections: [null]}}
     */
    classificationTreesDatasetSetupObject : function() {
        return {
            name: arbor.constants.kClassTreeDataSetName,
            title : arbor.strings.sClassTreeDataSetTitle,
            description : arbor.strings.sClassTreeDataSetDescription,
            collections: [  // first, simple: one collection
                {
                    name: arbor.strings.sClassTreeCollectionName,
                    labels: {
                        singleCase: "tree",
                        pluralCase: "trees",
                        setOfCasesWithArticle: "our trees"
                    },
                    // The (child) collection specification:
                    attrs: [
                        {   //  what we are predicting, e.g., MI = yes
                            name : arbor.strings.sanPredict,
                            title: arbor.strings.sanPredict,
                            type: 'categorical',
                            description: arbor.strings.sadPredict
                        },
                        {   //  name of the focus attribute
                            name : arbor.strings.staticStrings.focusAttributeNameBoxLabel,
                            title: arbor.strings.staticStrings.focusAttributeNameBoxLabel,
                            type: 'categorical', description : arbor.strings.sadFocusAttributeName
                        },
                        {   //  value of the focus attribute
                            name : arbor.strings.staticStrings.focusAttributeValueBoxLabel,
                            title: arbor.strings.staticStrings.focusAttributeValueBoxLabel,
                            type: 'numeric', description : arbor.strings.sadFocusAttributeValue
                        },
                        //  N, the number of cases
                        {name : arbor.strings.sanN, title: arbor.strings.sanN, type: 'numeric', precision : 0, description : arbor.strings.sadN},
                        {name : arbor.strings.sanBaseRate, title: arbor.strings.sanBaseRate, title : "base rate", type: 'numeric', precision: 3, description : arbor.strings.sadBaseRate},

                        //  misclassification rate; note that this has a formula
                        {name : arbor.strings.sanMisclassificationRate, title: arbor.strings.sanMisclassificationRate, type: 'numeric', precision: 3, editable : true,
                            description : arbor.strings.sadMisclassificationRate,
                            formula : `(${arbor.strings.sanN} - ${arbor.strings.sanTP} - ${arbor.strings.sanTN})/${arbor.strings.sanN}`
                        },

                        //  the four base stats!
                        {name : arbor.strings.sanTP, title: arbor.strings.sanTP, type: 'numeric', precision: 0, description : arbor.strings.sadTP},
                        {name : arbor.strings.sanFN, title: arbor.strings.sanFN, type: 'numeric', precision: 0, description : arbor.strings.sadFN},
                        {name : arbor.strings.sanFP, title: arbor.strings.sanFP, type: 'numeric', precision: 0, description : arbor.strings.sadFP},
                        {name : arbor.strings.sanTN, title: arbor.strings.sanTN, type: 'numeric', precision: 0, description : arbor.strings.sadTN},
                        //  two extras for no prediction
                        {name : arbor.strings.sanNPPos, title: arbor.strings.sanNPPos, type: 'numeric', precision: 0, description : arbor.strings.sadNPPos},
                        {name : arbor.strings.sanNPNeg, title: arbor.strings.sanNPNeg, type: 'numeric', precision: 0, description : arbor.strings.sadNPNeg},

                        //  sensitivity
                        {name : arbor.strings.sanSensitivity, title: arbor.strings.sanSensitivity, type: 'numeric', precision: 3, editable : true,
                            description : arbor.strings.sadSensitivity,
                            formula : ` ${arbor.strings.sanTP}/( ${arbor.strings.sanTP} +  ${arbor.strings.sanFN} +  ${arbor.strings.sanNPPos})`
                        },

                        //  number of nodes
                        {name : arbor.strings.sanNodes, title: arbor.strings.sanNodes, type: 'numeric', precision : 0, description : arbor.strings.sadNodes},
                        //  depth of the tree
                        {name : arbor.strings.sanDepth, title: arbor.strings.sanDepth, type: 'numeric', precision : 0, description : arbor.strings.sadDepth},

                        //  hidden the tree state! This is what lets the plugin reconstitute the tree on selection
                        {name : `state`, title: "state", type: 'categorical', description: "save state for this tree", editable : true, hidden: true}
                    ]
                }
            ]   //  end of collections

        }
    },

    regressionTreesDatasetSetupObject : function() {
        return {
            name: arbor.constants.kRegressTreeDataSetName,
            title: arbor.strings.sRegressTreeDataSetTitle,
            description : arbor.strings.sRegressTreeDataSetDescription,
            collections: [
                {
                    name: arbor.strings.sRegressTreeCollectionName,
                    labels: {
                        singleCase: "tree",
                        pluralCase: "trees",
                        setOfCasesWithArticle: "our trees"
                    },

                    attrs: [
                        {name : arbor.strings.sanPredict, title: arbor.strings.sanPredict, type: 'categorical', description: 'what are we predicting?'},
                        {name : arbor.strings.sanN, title: arbor.strings.sanN, type: 'numeric', precision : 0, description : 'total number of cases'},
                        {name : arbor.strings.sanNodes, title: arbor.strings.sanNodes, type: 'numeric', precision : 0, description : 'total number of nodes'},
                        {name : arbor.strings.sanDepth, title: arbor.strings.sanDepth, type: 'numeric', precision : 0, description : 'depth of tree'},

                        {name : arbor.strings.sanSumSSD, title: arbor.strings.sanSumSSD, type: 'numeric', precision: 3, description : 'total (normalized) sum of the sum of squares of deviation'},

                        {name : `state`, title: "state", type: 'categorical', description: "save state for this tree", editable : true, hidden: true}
                    ]
                }
            ]   //  end of collections
        }
    },
};


