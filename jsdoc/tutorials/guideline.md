This document provides guidelines which needs to follow in CSUnit framework.

## Test directory

It's recommended to write tests under any logical group and create a new folder with the same name as logical group inside `/csunit/tests/` directory.

Example:

To cover licensing related api(s), create a new folder with name **license** under `/csunit/tests/` and add files to write test cases inside **license** folder.

```
csunit
|__ tests
      |__ modules
            |__ license
                  |-- index.html
                  |-- index.js
                  |-- session.test.js
```

## Naming convention

### Test file name

Javascript file on which you will write test cases, that file name must be end with **<file_name>`.test.js`**.

Example:
_sessions.test.js_ - file holds test cases related to **Session**.

### Sub-test directory name

Name of the folder under `/csunit/tests/` directory should be **logical group** name of the test cases.

Example:

- **organization** would be the folder name under `/csunit/tests/` directory to test _Organization management_ related test api.
- **resource** would be the folder name under `/csunit/tests/` directory to test _Resource management_ related test api.

**Use relative path when referring Creo-SaaS api/class. Like: Session, Entitlement etc**

## Coding

### `import` modules

use `loadModule` or `requireOnly` method (based on your use) from `.\csunit\utils\esm.js` file to import `node.js` native modules or modules from `node_modules`. Otherwise `csunit` will fail in browser-mode.

### When to use `csunit` and when not in your code

Its a good practice to follow below guidelines about "when to use `csunit` and when not in your code":

- Whenever you are working on codes inside `csunit/tests/modules` folder & need to use **variables, methods, classes** from `csunit/src/libs` folder, always use `csunit` from `csunit/src/libs/index.js`. `csunit` object wrap all the public object in `csunit/src/libs` folder.

  > If your desired variables, methods, classes doesn't present in `csunit` object but present in `csunit/src/libs` folder, then raise an issue to add them in `csunit` object.

- Never use `csunit` object when you are working on codes inside `csunit/src/libs` folder. Use sub-modules to refer your desire variables, methods, classes inside `csunit/src/libs` folder.
