class Message {

    constructor(iPlayerID, iToGod, iDate, iSubject, iContents) {
        this.playerID = iPlayerID;  //  the player ID
        this.toGod = iToGod;
        this.date = iDate;
        this.subject = iSubject;
        this.contents = iContents;
    }

    asObject() {
        return {
            playerID : this.playerID,
            toGod : this.toGod,
            date : this.date,
            subject : this.subject,
            contents : this.contents
        }
    }
}