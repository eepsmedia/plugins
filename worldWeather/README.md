# World Weather plugin

Very early edition, late 2023. 

We get data on temperature and precipitation ONLY 
and daily ONLY
from a selected group of weather stations worldwide.
Special attention to New Zealand and Australia, and Grenada, Spain.
In late 2024, we added a few stations in Iran. 

Data come from NOAA's Climate Data Observatory.
See https://www.ncei.noaa.gov/cdo-web/search.
Once there, use the search tool. 
You can search for cities or countries, etc., but ultimately you want a "station list" and information about the station. 
This includes the station ID, which is the string following `GCHMD`. 

For example, Kerman, Iran has an ID of `GHCND:IR000040841`. 
The page where you get that has latitude, longitude, and elevation.
With that information, update `src/stations.js`, and in the `stationList` array, add this:

```
        {
            "name": "Kerman, Iran",
            "stationid": "IR000040841",
            "latitude": 30.25,
            "longitude": 56.967,
            "elevation": 1754,
            "name2": "KERMAN"
        },
```

