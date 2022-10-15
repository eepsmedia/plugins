

simmer.toolbox = {
    "kind": "categoryToolbox",
    "contents": [

        //      random

        {
            "kind": "category",
            "name": "Random",
            "contents": [
                {
                    'kind': 'block',
                    'type': 'random_integer'
                },
                {
                    'kind': 'block',
                    'type': 'random_pick'
                },
                {
                    'kind': 'block',
                    'type': 'random_pick_from_two'
                },
                {
                    'kind': 'block',
                    'type': 'random_normal'
                },
            ]
        },

        //      loops

        {
            "kind": "category",
            "name": "Loops",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_repeat_ext",
                    "inputs": {
                        "TIMES": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 10
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_whileUntil",
                },
            ]
        },


        //      logic

        {
            "kind": "category",
            "name": "Logic & control",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },
                {
                    "kind": "block",
                    "type": "logic_compare"
                },
                {
                    "kind": "block",
                    "type": "logic_operation",
                },
            ]
        },

        //      variables

        {
            "kind": "category",
            "name": "Variables",
            "contents": [
                {
                    "kind": "block",
                    "type": "codap_emit"
                },
                {
                    "kind": "block",
                    "type": "variables_set"
                },
                {
                    "kind": "block",
                    "type": "variables_get"
                },
            ]
        },

        //      other

        {
            "kind": "category",
            "name": "Other",
            "contents": [
                {
                    "kind": "block",
                    "type": "text_print"
                },
                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "mutation_items": "2"
                },

                {
                    "kind": "block",
                    "type": "math_number"
                },
                {
                    "kind": "block",
                    "type": "math_arithmetic"
                },
                {
                    "kind": "block",
                    "type": "text"
                },
            ]
        },

    ]
}