
const stationList =
    [
        {
            "name": "Auckland",
            "stationid": "NZM00093110",
            "latitude": -37,
            "longitude": 174.8,
            "elevation": 7,
            "name2": "AUCKLAND AERO AWS"
        },
        {
            "name": "Wellington",
            "stationid": "NZM00093439",
            "latitude": -41.333,
            "longitude": 174.8,
            "elevation": 12,
            "name2": "WELLINGTON AERO"
        },
        {
            "name": "Christchurch",
            "stationid": "NZM00093781",
            "latitude": -43.489,
            "longitude": 172.532,
            "elevation": 37.5,
            "name2": "CHRISTCHURCH INTL"
        },
        {
            "name": "Invercargill",
            "stationid": "NZM00093844",
            "latitude": -46.417,
            "longitude": 168.333,
            "elevation": 2,
            "name2": "INVERCARGILL AIRPORT"
        },
        {
            "name": "Brisbane",
            "stationid": "ASN00040223",
            "latitude": -27.4178,
            "longitude": 153.1142,
            "elevation": 4,
            "name2": "BRISBANE AERO"
        },
        {
            "name": "Sydney",
            "stationid": "ASN00066037",
            "latitude": -33.9465,
            "longitude": 151.1731,
            "elevation": 6,
            "name2": "SYDNEY AIRPORT AMO"
        },
        {
            "name": "Melbourne",
            "stationid": "ASN00086282",
            "latitude": -37.6655,
            "longitude": 144.8321,
            "elevation": 113.4,
            "name2": "MELBOURNE AIRPORT"
        },
        {
            "name": "Hobart",
            "stationid": "ASN00094008",
            "latitude": -42.8339,
            "longitude": 147.5033,
            "elevation": 4,
            "name2": "HOBART AIRPORT"
        },
        {
            "name": "Adelaide",
            "stationid": "ASN00023034",
            "latitude": -34.9524,
            "longitude": 138.5204,
            "elevation": 2,
            "name2": "ADELAIDE AIRPORT"
        },
        {
            "name": "Perth",
            "stationid": "ASN00009021",
            "latitude": -31.9275,
            "longitude": 115.9764,
            "elevation": 15.4,
            "name2": "PERTH AIRPORT"
        },
        {
            "name": "Paris Le Bourget",
            "stationid": "FRM00007150",
            "latitude": 48.9675,
            "longitude": 2.4275,
            "elevation": 67,
            "name2": "LE BOURGET FR"
        },
        {
            "name": "London Heathrow",
            "stationid": "UKM00003772",
            "latitude": 51.478,
            "longitude": -0.461,
            "elevation": 25.3,
            "name2": "HEATHROW UK"
        },
        {
            "name": "Oslo",
            "stationid": "NOM00001492",
            "latitude": 59.9428,
            "longitude": 10.7206,
            "elevation": 94,
            "name2": "OSLO BLINDERN"
        },
        {
            "name": "Madrid",
            "stationid": "SPE00120287",
            "latitude": 40.3778,
            "longitude": -3.7892,
            "elevation": 687,
            "name2": "MADRID CUATROVIENTOS"
        },
        {
            "name": "Athens",
            "stationid": "GR000016716",
            "latitude": 37.9,
            "longitude": 23.75,
            "elevation": 10,
            "name2": "ATHENS HELLINIKON"
        },
        {
            "name": "Singapore ",
            "stationid": "SNM00048698",
            "latitude": 1.35,
            "longitude": 103.994,
            "elevation": 6.7,
            "name2": "SINGAPORE CHANGI INTERNATIONAL, SN"
        },
        {
            "name": "Kuala Lumpur",
            "stationid": "MYM00048650",
            "latitude": 2.7460000000000004,
            "longitude": 101.71,
            "elevation": 21,
            "name2": "KUALA LUMPUR INTL"
        },
        {
            "name": "Beijing",
            "stationid": "CHM00054511",
            "latitude": 39.933,
            "longitude": 116.28299999999999,
            "elevation": 55,
            "name2": "BEIJING"
        },
        {
            "name": "Shanghai",
            "stationid": "CHM00058367",
            "latitude": 31.166999999999998,
            "longitude": 121.43299999999999,
            "elevation": 7,
            "name2": "SHANGHAI HONGQIAO"
        },
        {
            "name": "Tokyo",
            "stationid": "JA000047662",
            "latitude": 35.683,
            "longitude": 139.767,
            "elevation": 36,
            "name2": "TOKYO"
        },
        {
            "name": "New Delhi",
            "stationid": "IN022021900",
            "latitude": 28.583000000000002,
            "longitude": 77.2,
            "elevation": 216,
            "name2": "NEW DELHI SAFDARJUN"
        },
        {
            "name": "Vostok",
            "stationid": "AYM00089606",
            "latitude": -78.45,
            "longitude": 106.867,
            "elevation": 3488,
            "name2": "VOSTOK"
        },
        {
            "name": "South Pole",
            "stationid": "AYW00090001",
            "latitude": -90,
            "longitude": 0,
            "elevation": null,
            "name2": "AMUNDSEN SCOTT"
        },
        {
            "name": "Vancouver",
            "stationid": "CA001108446",
            "latitude": 49.3,
            "longitude": -123.1167,
            "elevation": 3,
            "name2": "VANCOUVER HARBOUR"
        },
        {
            "name": "San Francisco",
            "stationid": "USW00023234",
            "latitude": 37.6197,
            "longitude": -122.3656,
            "elevation": 3,
            "name2": "SAN FRANCISCO INTL AP"
        },
        {
            "name": "Montréal",
            "stationid": "CA007014160",
            "latitude": 45.8167,
            "longitude": -73.4333,
            "elevation": 21,
            "name2": "L’ASSOMPTION (MONTREAL)"
        },
        {
            "name": "Fairbanks, AK",
            "stationid": "USW00026411",
            "latitude": 64.80309,
            "longitude": -147.87606,
            "elevation": 131.1,
            "name2": "FAIRBANKS INTERNATIONAL AP"
        },
        {
            "name": "Chicago",
            "stationid": "USW00094846",
            "latitude": 41.96017,
            "longitude": -87.93164,
            "elevation": 204.8,
            "name2": "CHACAGO OHARE INTL AP"
        },
        {
            "name": "Miami",
            "stationid": "USW00012839",
            "latitude": 25.78805,
            "longitude": -80.31694,
            "elevation": 1.4,
            "name2": "MIAMI INTERNATIONAL AP"
        },
        {
            "name": "Las Vegas",
            "stationid": "USW00023169",
            "latitude": 36.0719,
            "longitude": -115.16343,
            "elevation": 662.8,
            "name2": "LAS VEGAS MCCARRAN INTL AP"
        },
        {
            "name": "Boston",
            "stationid": "USW00014739",
            "latitude": 42.36057,
            "longitude": -71.00975,
            "elevation": 3.2,
            "name2": "BOSTON LOGAN INTL AP"
        },
        {
            "name": "Honolulu",
            "stationid": "US1HIHN0014",
            "latitude": 21.39,
            "longitude": -157.92,
            "elevation": 175,
            "name2": "AIEA (HONOLULU, HI)"
        },
        {
            "name": "Cape Town",
            "stationid": "SFM00068816",
            "latitude": -33.965,
            "longitude": 18.602,
            "elevation": 46,
            "name2": "CAPE TOWN INTERNATIONAL"
        },
        {
            "name": "Alexandria (Egypt)",
            "stationid": "EGM00062318",
            "latitude": 31.184,
            "longitude": 29.949,
            "elevation": -1.8,
            "name2": "ALEXANDRIA INTL"
        },
        {
            "name": "Buenos Aires",
            "stationid": "AR000875850",
            "latitude": -34.583,
            "longitude": -58.483000000000004,
            "elevation": 25,
            "name2": "BUENOS AIRES OBSERV"
        }
    ]

