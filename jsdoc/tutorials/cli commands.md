# Commands

This documentation having information about all commands available in CSUnit Command Line Interface(CLI) application.

## COMMAND

csunit-add|a - Create a test module or test files

## SYNOPSIS

```
csunit add  -d, --dir <dirname>
            -f, --file <filenames...>

csunit a    -d, --dir <dirname>
            -f, --file <filenames...>
```

## DESCRIPTION

-   This command creates a test module directory with `dirname` inside `/csunit/tests` directory. `dirname` must be in lowercase, otherwise command will convert it to lowercase. This command add following test structure to newly created `dirname` directory and fill those files with minimal required code snippet.

```
/csunit/tests/<dirname>
   |-- index.html
   |-- index.js
   |-- <dirname>.test.js
```

&emsp;&emsp;&emsp;Also update `/csunit/tests/home/index.js` file by adding `dirname` in `testModules` variable.

-   If user pass `-f [filenames]` option, command not create a new test module directory, instead creates test files with minimal required code snippet inside `/csunit/tests/<dirname>` directory.Created file naming convention is `<filename>.test.js`.

## OPTIONS

_-d, --dir \<dirname\>_ \
&emsp;Test module directory name.

_-f, --file \<filenames...\>_ \
&emsp;Test file names (input is an array).

## EXAMPLES

-   Create directory for test module `license`.

```
  $ csunit add -d license
  $ csunit add --dir license

  $ csunit a -d license
  $ csunit a -dir license
```

-   Create test file for `lease` for `license` test module.

```
  $ csunit add --dir license --file lease
  $ csunit add -d license --file lease
  $ csunit add --dir license -f lease

  $ csunit a --dir license --file lease
  $ csunit a -d license --file lease
  $ csunit a --dir license -f lease
```

-   Create test files for `appbundle` & `entitlement` for `license` test module.

```
  $ csunit add --dir license --file lease entitlement
  $ csunit add -d license --file lease entitlement
  $ csunit add --dir license -f lease entitlement

  $ csunit a --dir license --file lease entitlement
  $ csunit a -d license --file lease entitlement
  $ csunit a --dir license -f lease entitlement
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

csunit-remove|rm - Remove a test module or test files

## SYNOPSIS

```
csunit remove -d, --dir <dirname>
              -f, --file <filenames...>

csunit rm     -d, --dir <dirname>
              -f, --file <filenames...>
```

## DESCRIPTION

-   This command removes a test module directory with `dirname` inside `/csunit/tests` directory. `dirname` must be in lowercase, otherwise command will convert it to lowercase.

    Also update `/csunit/tests/home/index.js` file by removing `dirname` in `testModules` variable.

-   If user pass `-f [filenames]` option, command not remove test module directory, instead removes test files with minimal required code snippet inside `/csunit/tests/<dirname>` directory and created file naming convention is `<filename>.test.js`.

## OPTIONS

_-d, --dir \<dirname\>_ \
&emsp;Test module directory name.

_-f, --file \<filenames...\>_ \
&emsp;Test file names (input is an array).

## EXAMPLES

-   Remove directory for test module `license`.

```
  $ csunit remove -d license
  $ csunit remove --dir license

  $ csunit rm -d license
  $ csunit rm -dir license
```

-   Remove test file for `lease` for `license` test module.

```
  $ csunit remove --dir license --file lease
  $ csunit remove -d license --file lease
  $ csunit remove --dir license -f lease

  $ csunit rm --dir license --file lease
  $ csunit rm -d license --file lease
  $ csunit rm --dir license -f lease
```

-   Remove test files for `appbundle` & `entitlement` for `license` test module.

```
  $ csunit remove --dir license --file appbundle entitlement
  $ csunit remove -d license --file appbundle entitlement
  $ csunit remove --dir license -f appbundle entitlement

  $ csunit rm --dir license --file appbundle entitlement
  $ csunit rm -d license --file appbundle entitlement
  $ csunit rm --dir license -f appbundle entitlement
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

csunit-generate-package|gen-pkg - Generate package of Test suites

## SYNOPSIS

```
csunit generate-package
csunit gen-pkg
```

## DESCRIPTION

This command collects all test-suite methods for all test modules inside `/csunit/tests/modules` directory, generates `/csunit/src/export/testmodules.js` file and put all test-suite methods inside this file. If `/csunit/src/export/testmodules.js` already exists then command overwrite the file with new contents.

## EXAMPLES

-   Generate package.

```
  $ csunit generate-package
  $ csunit gen-pkg
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

csunit-list|li - List of the names of all test modules

## SYNOPSIS

```
csunit list
csunit li
```

## DESCRIPTION

This command collects all test modules name inside `/csunit/tests` directory and dump them in shell's console log.

## EXAMPLES

-   Get list of test module's name.

```
  $ csunit list
  $ csunit li
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

csunit-run|r - Run test module(s)

## SYNOPSIS

```
csunit run  -m, --module <dirname>
            -a, --all

csunit r    -d, --dir <dirname>
            -m, --module <dirname>
```

## DESCRIPTION

This command run test module(s) from `/csunit/tests` directory based on command options. Command executes test modules asynchronously in separate shells.

## OPTIONS

_-m, --module \<dirname\>_ \
&emsp;Test module directory name.

_-a, --all_ \
&emsp;Run all test modules from `/csunit/tests`.

## EXAMPLES

-   Run `license` test module.

```
  $ csunit run -m license
  $ csunit run --module license

  $ csunit r -m license
  $ csunit r --module license
```

-   Run all test modules.

```
  $ csunit run -a
  $ csunit run --all

  $ csunit r -a
  $ csunit r --all
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

csunit-gtm - Create/Update UIGTM project for Creo-SaaS backend C++ api

## SYNOPSIS

```
csunit gtm  -n, --new <projname>
            -u, --update <projname>
            -rs, --ref-system <refsystem>
```

## DESCRIPTION

This command create/update UIGTM project by adding Creo-SaaS backend C++ api files from `...\public\api\cpp` folder.

## OPTIONS

_-n, --new \<projname\>_ \
&emsp;Create new UIGTM project with `<projname>`.

_-u, --update \<projname\>_ \
&emsp;Update existing `<projname>` UIGTM project.

_-rs, --ref-system \<refsystem\>_ \
&emsp;Reference System for creating/updating UIGTM project. User can pass Reference system using environment variable `GTM_REF_SYSTEM`. If non of the variable is set then, command choose default reference system as project's reference system. You can also set `GTM_REF_SYSTEM` in `.env` file of creo-saas-backend server project.

## EXAMPLES

-   Create a new UIGTM project with project name `saas_otk` with default reference system.

```
  $ csunit gtm --new saas_otk
  $ csunit gtm --n saas_otk
```

-   Create a new UIGTM project with project name `saas_otk` using `-rs, --ref-system <refsystem>` command option.

```
  $ csunit gtm --new saas_otk --ref-system "t:\devsrc3"
  $ csunit gtm --n saas_otk --ref-system "t:\devsrc3"
  $ csunit gtm --new saas_otk -rs "t:\devsrc3"
  $ csunit gtm --n saas_otk -rs "t:\devsrc3"
```

-   Create a new UIGTM project with project name `saas_otk` using `GTM_REF_SYSTEM` environment variable.

```
  $ setenv GTM_REF_SYSTEM="t:\devsrc3"
  $ csunit gtm --new saas_otk
  $ csunit gtm --n saas_otk
```

-   Update `saas_otk`, an existing UGTM project.

```
  $ csunit gtm --update saas_otk
  $ csunit gtm --u saas_otk
```
