/*
==========================================================================

 * Created by tim on 2019-05-25.
 
 
 ==========================================================================
blodgett.variables in blodgett

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


blodgett.variables = [
/*
    {
        queryName: "Date",
        screenName: "date",
        description: "date",
        choosable : false,
        units: ""
    },
    {
        queryName: "Year",
        screenName: "year",
        description: "year",
        choosable : false,
        units: "A.D."
    },
    {
        queryName: "Hour",
        screenName: "hour",
        description: "hour (24-hour clock)",
        choosable : false,
        units: "hours"
    },
    {
        queryName: "Minute",
        screenName: "minute",
        description: "minutes",
        choosable : false,
        units: "minutes"
    },
*/
    {
        queryName: "dayDec",
        screenName: "decimalDate",
        description: "decimal days",
        choosable : false,
        units: "days"
    },
    {
        queryName: "T_0",
        screenName: "T_10ft",
        description: "air temperature at ground level (10 feet up)",
        choosable : true,
        units: "°C"
    },
    {
        queryName: "T_140",
        screenName: "T_140ft",
        description: "air temperature on the tower (140 feet up)",
        choosable : true,
        units: "°C"
    },
    {
        queryName: "SoilT20",
        screenName: "T_soil",
        description: "temperature in the soil (20 cm down)",
        choosable : true,
        units: "°C"
    },
    {
        queryName: "Precip",
        screenName: "precip",
        description: "precipitation (15 minutes)",
        choosable : true,
        units: "mm"
    },
    {
        queryName: "Pressure",
        screenName: "pressure",
        description: "air pressure",
        choosable : true,
        units: "mb"
    }

];