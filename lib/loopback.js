const fs = require('fs');



module.exports.isLoopbackProject = function(path) {
    try {
        return fs.existsSync(`${path}/package.json`) && fs.existsSync(`${getServerDir(path)}/model-config.json`);
    } catch(err) {
        return false;
    }
}

module.exports.getProjectInfo = function(path) {
    const raw = JSON.parse(fs.readFileSync(`${path}/package.json`));
    return {
        name: raw.name,
        version: raw.version
    }
}

module.exports.getModelJSON = function(path) {

    // Get the config file
    let config = JSON.parse(fs.readFileSync(`${getServerDir(path)}/model-config.json`));

    // Get the sources directories
    let sourcesDirectories = config._meta.sources;

    // Get each json file in the source directories
    let jsonModels = getAllModelsJSON(path, sourcesDirectories);

    // Parse as json
    let models = {};
    jsonModels.forEach(m => {
        let mObj = JSON.parse(fs.readFileSync(m));
        models[mObj.name] = mObj;
    });

    return models;
}

/**
 * Returns loopback server's directory
 * @param {*} path 
 */
function getServerDir(path) {
    return `${path}/server`;
}

/**
 * Returns all json files that we can found in the source directories
 * @param {*} sources directory path from the config file
 */
function getAllModelsJSON(path, sources) {
    let jsons = [];
    sources.forEach(s => {
        try {
            let files = fs.readdirSync(`${getServerDir(path)}/${s}`).map(f => `${getServerDir(path)}/${s}/${f}`);
            jsons.push(...files.filter(f => f.endsWith('.json')));
        } catch(error) {
            // nop
        };
    });
    return jsons;
}