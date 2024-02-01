const scenarios = {

    "vowels": {
        "useGlyphs": true,
        "useArt": false,
        "useText": false,
        "storyKey": "scenarios.vowels.story",
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
    }
}