const scenarios = {

    "vowelsCO": {
        "useGlyphs": true,
        "useArt": false,
        "useText": false,
        "storyKey": "scenarios.vowelsCO.story",
        "cardClass": "glyphOnly",
        "glyphs": {
            "P": ["B", "F", "M", "P", "X"],
            "notP": ["A", "E", "U"],
            "Q": [11, 23, 35, 17, 49],
            "notQ": [2, 4, 6, 8]
        },
        "labels": {
            "P": "a consonant",
            "notP": "a vowel",
            "Q": "odd",
            "notQ": "even"
        }
    },

    "vowelsVO": {
        "useGlyphs": true,
        "useArt": false,
        "useText": false,
        "storyKey": "scenarios.vowelsVO.story",
        "cardClass": "glyphOnly",
        "glyphs": {
            "P": ["A", "E", "U"],
            "notP": ["B", "F", "M", "P", "X"],
            "Q": [1, 3, 5, 7, 9],
            "notQ": [2, 4, 6, 8]
        },
        "labels": {
            "P": "a vowel",
            "notP": "a consonant",
            "Q": "odd",
            "notQ": "even"
        }
    },

    "vowelsEC": {
        "useGlyphs": true,
        "useArt": false,
        "useText": false,
        "storyKey": "scenarios.vowelsEC.story",
        "cardClass": "glyphOnly",
        "glyphs": {
            "P": [2, 4, 6, 8],
            "notP": [1, 3, 5, 7, 9],
            "Q": ["B", "F", "M", "P", "X"],
            "notQ": ["A", "E", "U"]
        },
        "labels": {
            "P": "even",
            "notP": "odd",
            "Q": "a consonant",
            "notQ": "a vowel"
        }
    },

    "rain": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.rain.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.rain.P",
            "notP": "scenarios.rain.notP",
            "Q": "scenarios.rain.Q",
            "notQ": "scenarios.rain.notQ"
        },
    },

    "ppm400": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.ppm400.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.ppm400.P",
            "notP": "scenarios.ppm400.notP",
            "Q": "scenarios.ppm400.Q",
            "notQ": "scenarios.ppm400.notQ"
        },
    },
    "whiskey": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.whiskey.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.whiskey.P",
            "notP": "scenarios.whiskey.notP",
            "Q": "scenarios.whiskey.Q",
            "notQ": "scenarios.whiskey.notQ"
        },
    },
    "license": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.license.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.license.P",
            "notP": "scenarios.license.notP",
            "Q": "scenarios.license.Q",
            "notQ": "scenarios.license.notQ"
        },
    },
    "passport": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.passport.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.passport.P",
            "notP": "scenarios.passport.notP",
            "Q": "scenarios.passport.Q",
            "notQ": "scenarios.passport.notQ"
        },
    },
    "fever": {
        "useGlyphs": false,
        "useArt": false,
        "useText": true,
        "storyKey": "scenarios.fever.story",
        "cardClass": "textOnly",
        "textKeys": {
            "P": "scenarios.fever.P",
            "notP": "scenarios.fever.notP",
            "Q": "scenarios.fever.Q",
            "notQ": "scenarios.fever.notQ"
        },
    },
}

const scenarioSets = {
    "vowels0": {
        "memberKeys": ["vowelsVO"]
    },
    "vowels": {
        "memberKeys": ["vowelsVO", "vowelsCO", "vowelsEC"]
    },
    "rain": {
        "memberKeys": ["rain"]
    },
    "climate": {
        "memberKeys": ["ppm400"]
    },
    "laws" : {
        "memberKeys" : ["whiskey", "license", "passport", "fever"]
    }
};
