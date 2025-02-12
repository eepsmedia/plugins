// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import * as FB from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {getAnalytics} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {firebaseConfig} from "../hidden/credentials.js"

let db = null;
let app = null;
let analytics = null;

let nounsCR = null;     //      "nouns" collection reference
let simsCR = null;     //      "sims" collection reference

// Initialize Firebase

/**
 * Initialize the connection to the plurals database
 *
 * @returns {Promise<*[]>} an Array of records of plurals
 */
export async function initialize() {
    let out = [];
    app = await initializeApp(firebaseConfig);
    db = await FB.getFirestore(app);
    analytics = await getAnalytics(app);

    nounsCR = FB.collection(db, "nouns");
    simsCR = FB.collection(db, "sims");

    /*
    const querySnapshot = await FB.getDocs(nounsCR);

    querySnapshot.forEach(doc => {
        const theData = doc.data();
        out.push(theData)
    });

    out.sort( (a, b) => { return (a.singular > b.singular) ? 1 : -1} );

    return out;

     */
}

export async function getOneEntry(iSingular) {

    const docRef = FB.doc(db, "nouns", iSingular);
    const docSnap = await FB.getDoc(docRef);

    const theData = docSnap.data();

    return theData;
}


/**
 * Add the given record, with default values for the timestamp and for the certification,
 * to the online database.
 *
 * @param iRecord
 * @returns {Promise<void>}
 */
export async function addPlural(iRecord) {
    //  iRecord.modified = firebase.firestore.FieldValue.serverTimestamp()
    iRecord.modified = FB.serverTimestamp();
    iRecord.certified = false;
    const docRef = FB.doc(db, "nouns", iRecord.singular);
    await FB.setDoc(docRef, iRecord);
    console.log(`   added doc for ${iRecord.plural} reference (singular) ${docRef.id}`)
}

/**
 * Set whether the given singular is "certified" correct
 *
 * @param iSingular
 * @param iCert
 * @returns {Promise<void>}
 */
export async function setCertification(iSingular, iCert) {
    // get the document reference

    const theRef = FB.doc(db, "nouns", iSingular);
    FB.updateDoc(theRef, {
        certified: iCert,
        modified: FB.serverTimestamp()
    });
}


export async function recordEngage(iState) {

    const now = await FB.serverTimestamp();

    let theValues = {
        "eventsPerExperiment": iState.atomicEventsPerExperiment,
        "experimentsPerRun": iState.experimentsPerRun,
        "successProbability": iState.parsedProbability.theNumber,
        "words": iState.words,
        "when": now,
        "where" : iState.where,
        "lang" : iState.lang
    }

    try {
        await FB.addDoc(simsCR, theValues);
        console.log(`recorded this simulation run with ${JSON.stringify(theValues)}`);
    } catch (err) {
        console.log(`error : ${err}`);
        console.log(`error recording this simulation run with ${JSON.stringify(theValues)}`);

    }

}