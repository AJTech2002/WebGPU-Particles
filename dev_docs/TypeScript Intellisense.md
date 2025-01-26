# Generating Intellisense Types
`npm run gen/types` - Gens the TS Types from the src folder
`npm run gen/libs` - Gens the LIB.json file that is used for intellisense by code mirror

Then check `tsUtils.ts` this is where the imports are done: 

Ex.

```
import { vec3, vec4 } from "gl-matrix";
import {Boid} from "/gameTypes/game/boids/boid.d.ts";
import {GameContext} from "/gameTypes/interface/interface.d.ts";
```

The `/gameTypes/` is gathered from `lib.json` which contains the file maps to the type declaration text.

**ENSURE:**

- Paths setup correctly in `tsconfig.declaration.json`
- Paths setup correctly in Vite Config

**Flow**
1. The `gen/types` is used to create the TS Declarations, this uses the `tsconfig.declaration.json` file
2. The `npx tscpaths -p ./tsconfig.declaration.json -s ./src -o ./gameTypes` is used to turn relative paths (eg. `@game` into absolute paths)
3. The `gen/libs` is used to copy the TS Declarations into a JSON format associated with a path in order for the interpreter to use

**TODOS**
- [ ] Ensure that we can import whole directories by generating automatic index files - this doesn't work right now so we have to manually do the `tsUtils` step to declare the modules