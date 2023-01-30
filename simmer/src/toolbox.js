

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

        //      loops & Logic

        {
            "kind": "category",
            "name": "Control and Loops",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },


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

        //      numbers and values

        {
            "kind": "category",
            "name": "Numbers and values",
            "contents": [
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


        //  functions

        {
            "kind": "category",
            "name": "Functions",
            "contents": [
                {
                    "kind": "block",
                    "type": "procedures_defnoreturn"
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
            "name": "Misc",
            "contents": [

                {
                    "kind": "block",
                    "type": "text_print"
                },

            ]
        },

    ]
}