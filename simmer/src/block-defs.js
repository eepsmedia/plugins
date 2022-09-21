Blockly.common.defineBlocksWithJsonArray([

    //      CODAP emit

    {
        "type": "codap_emit",
        "message0": "emit in CODAP: %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VARIABLES",
                "check": [
                    "Array",
                    "String"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "plug in a list of variables to emit",
        "helpUrl": ""
    },

    //      random integer

    {
        "type": "random_integer",
        "message0": "random integer in [%1, %2]",
        "args0": [
            {
                "type": "field_number",
                "name": "LOWER",
                "check" : "Number",
                "value" : 1,
                "precision" : 1,
            },
            {
                "type": "field_number",
                "name": "UPPER",
                "check" : "Number",
                "value" : 6,
                "precision" : 1,
            },

        ],
        "output" : "String",
        "colour": 888
    },

    //      random pick

    {
        "type": "random_pick",
        "message0": "pick from %1",
        "args0": [
            {
                "type": "input_value",
                "name": "LIST",
                "check": "Array"
            }
        ],
        "output": null,
        "colour": 888,
        "tooltip": "",
        "helpUrl": ""
    }
]);

Blockly.JavaScript['codap_emit'] = function(block) {
    const theVariables = Blockly.getMainWorkspace().getAllVariables();

   // const value_variables = Blockly.JavaScript.valueToCode(block, 'VARIABLES', Blockly.JavaScript.ORDER_ATOMIC);  //  variable names
    //const theNames = (Array.isArray(value_variables)) ? value_variables : [value_variables];

    let code = "let arg = [];\n let oneVar = {};\n";
    theVariables.forEach( v => {
        vName = v.name;
        // code += `let oneVar = {"name" : "${vName}", "value" : eval(${vName})};\n`;
        //      code += `if (typeof ${vName} != undefined) {\n`;    //  in case the variable doesn't exist
        code += `oneVar = {};\n try {\n `
        code += `oneVar["${vName}"] = eval(${vName}); arg.push(oneVar);\n`;
        code += `} catch (msg) { \nconsole.log(msg); \n}\n`;
        //        code += `}\n`;          //      end of if
    })

    code += `simmer.connect.codap_emit(arg);\n`
    //  simmer.connect.codap_emit(`${theObjectString}`);
    return code;
};

Blockly.JavaScript['random_integer'] = function(block) {
    let lower = block.getFieldValue('LOWER');
    let upper = block.getFieldValue('UPPER');

    return [`random_functions.integer(${lower}, ${upper})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick'] = function(block) {
    const value_list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_ATOMIC);
    const code = `random_functions.pickFrom(${value_list})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['text_print'] = function(block) {
    const msg = Blockly.JavaScript.valueToCode(
        block, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || "''";

    return `console.log(${msg});\n`;;
};

