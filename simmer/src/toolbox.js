

simmer.toolbox = {
    "kind": "categoryToolbox",
    "contents": [

        //      CODAP

        {
            "kind": "category",
            "name": "CODAP",
            "contents": [
                {
                    "kind": "block",
                    "type": "codap_emit"
                }
                ]
        },

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
                    'type': 'random_pick_from_two_advanced'
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
                    "type": "variables_set"
                },
                {
                    "kind": "block",
                    "type": "variables_get"
                },
            ]
        },

        //  arrays and lists

        {
            "kind": "category",
            "name": "Arrays and lists",
            "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "message0": "empty list",
                    "extraState": {
                        "itemCount": 0 // or whatever the count is
                    }
                },

                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "extraState": {
                        "itemCount": 2 // or whatever the count is
                    }
                },
                {
                    'kind': 'block',
                    'type': 'lists_push',
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
                    "type": "procedures_defnoreturn"
                },

                {
                    "kind": "block",
                    "type": "text_print"
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