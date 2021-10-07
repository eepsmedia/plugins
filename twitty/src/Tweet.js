/*
==========================================================================

 * Created by tim on 10/6/21.
 
 
 ==========================================================================
Tweet in twitty

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

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

class Tweet {
    constructor(iTweet) {
        this.when = new Date(iTweet.date);
        this.where = iTweet.user.location;
        this.what = iTweet.content;
        this.who = iTweet.user.displayname;
        this.likes = iTweet.likeCount;
        this.id = iTweet.id;
        this.lang = iTweet.lang;
    };

    toString() {
        return `${this.who} (${this.likes} like(s)): "${this.what}"`
    }
}