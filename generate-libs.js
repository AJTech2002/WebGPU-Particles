import { writeFileSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import * as fs from "fs";
import * as path from "path";
import * as typescript from "typescript";
import { fileURLToPath } from "url";

const getLib = (name) => {
    const lib = dirname(typescript.sys.getExecutingFilePath())
    return readFileSync(join(lib, name), "utf8")
}

const getNodeModule = (name, core) => {
    const __filename = fileURLToPath(import.meta.url);
    const lib = dirname(__filename);
    let path = join( lib + "/node_modules", name, core);
    console.log(path);
    return readFileSync(path, "utf8")
}

const addLib = (name, map) => {
    map.set("/" + name, getLib(name))
}

const addModule = (name, core,withName, map) => {
    map.set(withName, getNodeModule(name, core))
}

// recursively add all the .ts files inside a specific directory
const addDir = (dir, map, fileMaps ) => {
    readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
            addDir(fullPath, map, fileMaps)
        } else if (file.endsWith(".ts")) {
            let contents = fs.readFileSync(fullPath, "utf8");
            map.set("/" + fullPath, contents);
            console.log(fullPath);
            fileMaps.push(fullPath);
        }
    })

}

const createIndex = (dir, map, fileMaps) => {
    // create an index file that imports all the files in the directory
    let indexFile = "";
    fileMaps.forEach((file) => {
        indexFile += `import "./${file}";\n`
    })

    map.set("/" + dir + "/index.ts", indexFile)
 
}

const addAsSingleDir = (dir, map, rootImportName) => {
    let allContents = '';

    const processDir = (currentDir) => {
        readdirSync(currentDir).forEach((file) => {
            const fullPath = path.join(currentDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                processDir(fullPath); // Recursive call for subdirectories
            } else if (file.endsWith(".ts")) {
                allContents += fs.readFileSync(fullPath, "utf8") + '\n'; // Append file contents
            }
        });
    };

    processDir(dir);
    map.set(`/${rootImportName}`, allContents); // Store all contents under one entry
};

const createDefaultMap2015 = () => {
    const fsMap = new Map();  // Initialize fsMap as a Map
    addLib("lib.es2015.d.ts", fsMap)
    addLib("lib.es2015.collection.d.ts", fsMap)
    addLib("lib.es2015.core.d.ts", fsMap)
    addLib("lib.es2015.generator.d.ts", fsMap)
    addLib("lib.es2015.iterable.d.ts", fsMap)
    addLib("lib.es2015.promise.d.ts", fsMap)
    addLib("lib.es2015.proxy.d.ts", fsMap)
    addLib("lib.es2015.reflect.d.ts", fsMap)
    addLib("lib.es2015.symbol.d.ts", fsMap)
    addLib("lib.es2015.symbol.wellknown.d.ts", fsMap)
    addLib("lib.dom.d.ts", fsMap)
    addLib("lib.es5.d.ts", fsMap)
    
    var files = [];
    addDir("gameTypes", fsMap, files);

    createIndex("gameTypes", fsMap, files);

    addModule("gl-matrix", "index.d.ts", "/gl-matrix.d.ts", fsMap);
    return fsMap
}


// Path: ./public/lib.d.ts
const fsMap = createDefaultMap2015()
const lib = Object.fromEntries(fsMap);

// Write the object as JSON to ./public/lib.d.ts
writeFileSync("./src/lib.json", JSON.stringify(lib, null, 2));
