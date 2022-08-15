| NOTE:            |
| :--------------- |
| Work in progress |

**Table of Contents**

-   [Introduction](#introduction)
-   [How to create test suite](#how-to-create-test-suite)
-   [How to execute test suite](#how-to-execute-test-suite)
    -   [node environment](#node-environmemt)
    -   [browser environment](#browser-environmemt)
-   [How to create trail file](#how-to-create-trail-file)
-   [How to execute trail file](#how-to-execute-trail-file)
-   [How to run gitlab pipeline script in local project](#how-to-run-gitlab-pipeline-script-in-local-project)
    -   [Prerequisite](#prerequisite)
        -   [System](#system)
        -   [Update `apps\service\.env`](#update-env)
    -   [Steps](#steps)
    -   [Result](#result)
-   [How to convert test to `todo` test](#how-to-convert-test-to-todo-test)

## Instructions <a name="introduction"></a>

This document will help by providing _"how to"_ instructions for different topics of **CSUnit**.

## How to create test suite <a name="how-to-create-test-suite"></a>

To add a new test suite; api `CSUnit.Test.suite()` should be called as shown below.

```js
CSUnit.Test.suite({
  label: "<test suite title>",
  method: <test_suite_method>
});
```

-   Test*suite_method will contain \_test cases*.

-   To add multiple test suites, call `CSUnit.Test.suite()` multiple times with respective _test suite method_.

-   After adding test suites, you need to call `CSUnit.Test.load()` which does rest of the things; like: load ui, add event listener etc.

> Always call `CSUnit.Test.suite()` method before calling `CSUnit.Test.load()`.

-   In _Creo (embedded) Browser_ OR _Standalone Browser_ open `index.html` file from your test sub-folder under **_/csunit/tests/modules_**. Like:

    http://localhost:3000/csunit/tests/modules/**\<sub-test-folder-name>**/index.html

## How to execute test suite <a name="how-to-execute-test-suite"></a>

### node environment <a name="node-environmemt"></a>

### browser environment <a name="browser-environmemt"></a>

To run tests in browser, do the followings:

-   In _Creo (embedded) Browser_ OR _Standalone Browser_ open `<creo-saas-backend-server>/csunit/tests/modules/home/index.html`. Like:

    http://localhost:3000/csunit/tests/modules/home/index.html

-   In _Creo (embedded) Browser_ OR _Standalone Browser_ open `index.html` file from module folder under **_/csunit/tests/modules_** folder to execute specific test modules. Like:

    http://localhost:3000/csunit/tests/modules/**\<sub-test-folder-name>**/index.html

> Specify additional information about creo-embedded browser

## How to create trail file <a name="how-to-create-trail-file"></a>

## How to execute trail file <a name="how-to-execute-trail-file"></a>

## How to run gitlab pipeline script in local project <a name="how-to-run-gitlab-pipeline-script-in-local-project"></a>

Now `gitlab ci/cd` pipeline executes test cases created using csunit framework. `csunit-tests` job is added to executes test cases in gitlab ci/cd pipeline.
To execute test cases in pipeline we created a node based infrastructure with the help of test _runner_ provided by csunit itself. You can leverage this infrastructure to execute same pipeline test cases in you local project before doing a merge request in gitlab.

This section will help you to execute pipeline test cases.

### Prerequisite <a name="prerequisite"></a>

#### System <a name="system"></a>

-   node.js installed in your machine. you need to install at least node.js version: _v14.16.1_.
-   visual studio code (optional)

#### Update `env` <a name="update-env"></a>

You need to update `apps\service\.env` file with below variables, those are mandatory variables and without them pipeline will not work:

> NODE_CLIENT_URL=\<creo-saas-backend server url\>
>
> NODE_TESTER_USERNAME=\<username/email of the tester\>
>
> NODE_TESTER_COMPANY=\<company of the tester\>

Example:

```
NODE_CLIENT_URL=http://localhost:3000
NODE_TESTER_USERNAME="csunitadmin@ptc.com"
NODE_TESTER_COMPANY="Parametric technology Inc"
```

Below variables are utility variables which help you in specific cases.

1. NODE_PIPELINE_IGNORE_MODULES - Array of test module names which you want to ignore to execute by pipeline.
   Example:

```
NODE_PIPELINE_IGNORE_MODULES=["license"]
```

2. NODE_PIPELINE_MODULE - ONLY execute test cases of this module.
   Example:

```
NODE_PIPELINE_MODULE="license"
```

3. NODE_PIPELINE_MODULE_FILE - ONLY execute test cases mentioned in this file. This variable has a dependency of `NODE_PIPELINE_MODULE` variable. So, `NODE_PIPELINE_MODULE` must add before adding this variable. And test filename mentioned in this variable must be available on `NODE_PIPELINE_MODULE` module, otherwise pipeline will abort the test execution.
   Example:

```
NODE_PIPELINE_MODULE_FILE="session"
```

### Steps <a name="steps"></a>

Please follow below steps to execute pipeline test cases:

1. Complete the `Prerequisite` section.
2. Open a new shell window which has `node.js` support.
3. Navigate to **_creo-saas-backing-services-poc_** local project path.
4. Execute `$ npm run initCSUnitDB` command, if you want to use similar database which gitlab ci/cd pipeline job use.
    > _This step is an **optional** step, you can ignore if you wants to continue with your current database._
5. Execute `$ npm run tsc` command if you did `git clone / git pull / git merge`.
6. If creo-saas backend server is not running then execute `$ npm start` command to up & running the backend server.
7. Open another new shell window if you did step _6_.
8. Navigate to **_creo-saas-backing-services-poc_** local project path.
9. Do further navigation to **_.\apps\service\src\public\csunit_** path.
10. Execute `$ npm install` command.
    > It’s recommended to execute this command whenever you do `git clone / git pull / git merge` operation.
11. Finally execute `$ npm run pipeline` command.

Example:

Step 1 - 6:

```
D:\Users\anath>> cd D:/cloud/creo-saas-backing-services-poc
D:\cloud\creo-saas-backing-services-poc>> npm run initCSUnitDB
D:\cloud\creo-saas-backing-services-poc>> npm run tsc
D:\cloud\creo-saas-backing-services-poc>> npm start
```

Step 8 - 11:

```
D:\Users\anath>> cd D:/cloud/creo-saas-backing-services-poc
D:\cloud\creo-saas-backing-services-poc>> cd .\apps\service\src\public\csunit
D:\cloud\creo-saas-backing-services-poc\apps\service\src\public\csunit>> npm install
D:\cloud\creo-saas-backing-services-poc\apps\service\src\public\csunit>> npm run pipeline
```

### Result <a name="result"></a>

After completion of `$ npm run pipeline` command, you will get pipeline test execution summery in the shell’s console, which will look similar to following:

![pipeline result](images/csunit-tests.png)

From console log, you can identify all tests are passing or not by evaluating `status`. If you wants know more information about test cases, pipeline dump `csunit_result.log` file in current directory and you can explore this file.

## How to convert test to `todo` test <a name="how-to-convert-test-to-todo-test"></a>

Due to some valid reason you need to merge your code changes to `master` branch while gitlab `csunit-tests` pipeline is failing and you are unable to fix failed tests immediately. For such cases you can convert those failed tests into `QUnit.test.todo` test which will pass `csunit-tests` pipeline & you will be able to merge your code changes.

> Please discuss with concern person before convert test to `QUnit.test.todo`.

Here is the steps to covert failed test to `QUnit.test.todo`:

1. Open `*.tets.js` file where failed tests are written.
2. Navigate to each test cases.
3. Replace `QUnit.test` for each test by `QUnit.test.todo`.
4. Save `*.tets.js` file.
5. Run gitlab [pipeline](#how-to-run-gitlab-pipeline-script-in-local-project) script in local project.

Example:

Original:

```js
QUnit.test('Closed', (assert) => {
    QUnit.assertCreoJSThen(
        assert,
        { max: 10000 },
        closeSessions(sessions),
        (response, assertion) => {
            // CSUnit.OStream.debug(response);

            assertion.ok(true, 'Sessions closed');
        }
    );
});
```

After replace:

```js
QUnit.test.todo('Closed', (assert) => {
    QUnit.assertCreoJSThen(
        assert,
        { max: 10000 },
        closeSessions(sessions),
        (response, assertion) => {
            // CSUnit.OStream.debug(response);

            assertion.ok(true, 'Sessions closed');
        }
    );
});
```

> Once tests are fixed, revert `QUnit.test.todo` tests to normal tests by replacing them with `QUnit.test`.

To know more about `QUnit.test.todo`, check [QUnit official doc](https://api.qunitjs.com/QUnit/test.todo/).
