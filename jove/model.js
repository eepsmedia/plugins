/*
==========================================================================

 * Created by tim on 2019-04-10.
 
 
 ==========================================================================
model in jove

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

jove.model = {

    moons: [],

    time: 0,       //  game time, seconds
    clear: false,

    constants: {
        timeStep: 3600,
        AU: 1.50e11,        //      AU im m
        jupiterOrbit: 7.783e11,        //      semimajor axis in m
        jupiterRadius : 71492000,       //  planet's radius in m
        secondsPerDay: 86400,
        primaryMass: 1.898e27,          //      Jupiter, kg
        bigG: 6.674e-11,                //      m^3 kg^-1 s^-2
        ioOrbit:        0.4218e09,      //      orbital radius, m
        europaOrbit:    0.6711e09,      //      orbital radius, m
        ganymedeOrbit:  1.070e09,       //      orbital radius, m
        callistoOrbit:  1.882e09        //      orbital radius, m
    },

    initialize: function () {
        const tPrimary = {
            mass: jove.model.constants.primaryMass
        };
        this.addBasicMoon(tPrimary, jove.model.constants.ganymedeOrbit, "Ganymede", false);    //  temp, Ganymede
        this.addBasicMoon(tPrimary, jove.model.constants.ioOrbit, "Io", true);          //  temp, Io
        this.addBasicMoon(tPrimary, jove.model.constants.europaOrbit, "Europa", false);      //  temp, Europa
        this.addBasicMoon(tPrimary, jove.model.constants.callistoOrbit, "Callisto", false);    //  temp, Callisto
    },

    addBasicMoon: function (iPrimary, iRadius, iName, flip) {
        const GM = jove.model.constants.bigG * iPrimary.mass;
        const r = flip ? -iRadius : iRadius;
        const v = flip ? -Math.sqrt(GM / iRadius) : Math.sqrt(GM / iRadius);

        let tMoon = new Moon(
            new Location(r, 0, 0),
            new Location(0, v, 0),
            iPrimary,
            iName
        );
        this.moons.push(tMoon);

    },

    update: function (iTime) {
        let timeLeft = iTime;
        let dt = this.constants.timeStep;

        while (timeLeft > 0) {
            if (timeLeft < dt) {
                timeLeft = dt;
            }

            this.moons.forEach(m => {
                m.RK4update(dt);
            });

            this.time += dt;
            timeLeft -= dt;
        }

        //  weather
        this.clear = jove.state.weather ? (Math.random() < 0.4) : true;
    },

    primaryData : function() {
        const d = jove.model.constants.jupiterOrbit;

        return {
            distance : d
        }

    },

    moonPositionArray: function () {
        let out = [];
        const pd = this.primaryData();

        const eclipseAngle = this.constants.jupiterRadius / pd.distance;

        this.moons.forEach(m => {

            const xAngle = m.x.x / pd.distance;

            if (Math.abs(xAngle) > eclipseAngle) {      //  no data if planet is behind the primary
                const moonObject = {
                    t: jove.model.time / jove.model.constants.secondsPerDay,
                    x: m.x.x / pd.distance * 1000,
                    y: m.x.z / pd.distance * 1000,
                    name: (jove.state.moonNames ? m.name : "")
                };
                out.push(moonObject);
            }
        });
        return out;
    }
};