const clc = require('cli-color');
const LoopbackUtil = require('./loopback');
const PlantUML = require('./plantuml');
const PROJ_PATH = process.cwd();
const TXT_EXT = '.txt';
const OUT_EXT = '.png';

// color term
const {cyan, red, yellow} = clc.red;

exports.execute = function(outputName) {
    console.log(cyan('\nLoopback-UML-Generator started...\n'));

    if (!LoopbackUtil.isLoopbackProject(PROJ_PATH)) {
        console.error(red(' ✗ Please ensure you run the UML generator in a valid Loopback project.'));
        return process.exit(-1);
    }

    const PlantUMLroot = process.env.PLANTUML_JAR;

    if (!PlantUMLroot) {
        console.error(red(' ✗ Please ensure you export the plantuml.jar path as `PLANTUML_JAR` before running the script.'));
        return process.exit(-2);
    }

    const projInfo = LoopbackUtil.getProjectInfo(PROJ_PATH);
    const defaultExportName = `UML-Generator-${projInfo.name}-${projInfo.version}`;
    const exportName = outputName || defaultExportName;
    const txtName = `${exportName}${TXT_EXT}`;
    const imgName = `${exportName}${OUT_EXT}`;

    console.log(` - PlantUML description file will be saved as ${cyan(txtName)}`);
    console.log(` - PlantUML image file will be saved as ${cyan(imgName)}`);
    console.log(` - PlantUML jar used: ${cyan(PlantUMLroot)}`);

    const lbModels = LoopbackUtil.getModelJSON(PROJ_PATH);

    console.log(` ✓ Discovered ${cyan(Object.keys(lbModels).length + ' JSON model(s)')} in this project`);

    let umlInstance = PlantUML.create();

    Object.keys(lbModels).forEach(m => {

        let modelObj = lbModels[m];
        PlantUML.addClass(umlInstance, modelObj.name);
    
        Object.keys(modelObj.properties).forEach(p => {
            PlantUML.addClassProperty(umlInstance, modelObj.name, p, modelObj.properties[p].type);
        });
    
        Object.keys(modelObj.methods).forEach(m => {
            PlantUML.addClassMethod(umlInstance, modelObj.name, m);
        });
    
        Object.keys(modelObj.relations).forEach(r => {
            PlantUML.addRelationBetween(umlInstance, r, modelObj.name, modelObj.relations[r].model, modelObj.relations[r].type);
        });
    });

    console.log(' ♥ PlantUML started, please wait a few seconds...');

    // Save as txt, and generate the png
    PlantUML.saveAsTxt(umlInstance, txtName);
    PlantUML.generateFrom(PlantUMLroot, txtName, (success) => {
        if (success) {
            console.log(' ✓ Done! Bye ♥');
            return process.exit(-3);
        } else {
            console.error(red(' ✗ Error, cannot generate the UML diagram. Please ensure the plantuml.jar file path is correct.'));
            return process.exit();
        }
    });
}