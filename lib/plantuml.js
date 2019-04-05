'use strict';

const fs = require('fs');
const { exec } = require('child_process');
const TXT_EXT = '.txt';
const OUT_EXT = '.png';

// (c) François Leparoux
// Home-made plantuml nodejs lib

module.exports.create = () => {
    return {
        classes: {},
        relations: []
    };
}

module.exports.addClass = (inst, className) => {
    inst.classes[className] = {
        properties: {},
        methods: []
    };
}

module.exports.addClassProperty = (inst, className, propName, type) => {
    inst.classes[className].properties[propName] = {
        type: type
    }
}

module.exports.addClassMethod = (inst, className, methName) => {
    inst.classes[className].methods.push(methName);
}

module.exports.addRelationBetween = (inst, name, fromModel, toModel, type) => {
    inst.relations.push({from: fromModel, to: toModel, as: name, type: formatLoopbackType(type)});
}

module.exports.saveAsTxt = (inst, name) => {
    let txt = [];

    // start
    txt.push('@startuml');
    txt.push('');

    // class
    Object.keys(inst.classes).forEach(c => {
        let cObj = inst.classes[c];
        txt.push('class ' + c + ' {');

        // properties
        Object.keys(cObj.properties).forEach(p => {
            let pObj = cObj.properties[p];
            txt.push('  ' + p + ' : ' + pObj.type);
        });

        // methods
        cObj.methods.forEach(m => {
            txt.push('  ' + m + '()');
        });

        txt.push('}');
        txt.push('');
    });

    // relations
    inst.relations.forEach(r => {
        txt.push(r.from + ' ' + r.type + ' ' + r.to + ' : ' + r.as);
    });

    // end
    txt.push('@enduml');

    let txtFile = '';
    txt.forEach(t => txtFile += t + '\n');

    fs.writeFileSync(`${process.cwd()}/${name}`, txtFile);
}

module.exports.generateFrom = (jar, name, cb) => {
    exec(`java -jar ${jar} "${name}"`, (err, stdout, stderr) => {
        if (err) {
            return cb(false);
        }
        cb(true);
    });
}

function formatLoopbackType(type) {
    switch(type) {
        case 'belongsTo': return 'o-->';
        case 'hasMany': return '*-->';
        case 'hasOne': return '*-->';
        default: return '--';
    }
}