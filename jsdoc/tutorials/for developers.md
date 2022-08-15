| NOTE:            |
| :--------------- |
| Work in progress |

**Table of Contents**

-   [Lint](#lint)
    -   [Brief about ESLint](#brief-about-eslint)
    -   [ESLint in CSUnit](#eslint-in-csunit)
        -   [Setup](#setup)
        -   [Run](#run)
        -   [ESLint on gitlab CI/CD pipeline](#eslint-on-gitlab-cicd-pipeline)
    -   [References](#references)
-   [`gitlab` branch](#gitlab-branch)

## Lint <a name="lint"></a>

Lint, or a linter, is a static code analysis tool used to flag programming _errors_, _bugs_, _stylistic errors_ and _suspicious constructs_. In other words, it help to gain _code quality_ of the project. For JavaScript/TypeScript language many linting tools available & **ESLint** is one of the best linting tool among them.

So, we used ESLint as a linting tool for CSUnit to maintain code quality. Developer can run ESLint to lint their code changes & it also used in gitlab pipeline for auto lint on each merge request.

### Brief about ESLint <a name="brief-about-eslint"></a>

According to wikipedia,

> ESLint is a static code analysis tool for identifying problematic patterns found in JavaScript code. Rules in ESLint are configurable, and customized rules can be defined and loaded. ESLint covers both code quality and coding style issues. ESLint supports current standards of ECMAScript, and experimental syntax from drafts for future standards. Code using JSX or TypeScript can also be processed when a plugin or transpiler is used.

It's provide built-in rules as well as provision to add customized rules.

### ESLint in CSUnit <a name="eslint-in-csunit"></a>

CSUnit also use ESLint to lint it's source code to maintain code quality. We used `eslint-config-airbnb-base` config which is one of the popular eslint config.

![Lint CSUnit code](images/eslint-result.png)

#### Setup <a name="setup"></a>

Added `.eslintrc.json` inside `apps\service\src\public\csunit` folder which will be read by ESLint during execution of the linting process. This file is a configuration file for ESLint. We added as well as removed rules based on our requirement. In this file we can configure other options provided by ESLint.
We used `airbnb-base`, `plugin:@typescript-eslint/recommended` as `extends` config. Also added parser for TypeScript.

> You can modify `.eslintrc.json` file based on your requirement. Please consult before modifying.

ESLint has facility to ignore files/folders during lint process like: .gitignore. For that ESLint introduced `.eslintignore` file.
CSUnit project we also added `.eslintignore` inside `apps\service\src\public\csunit` folder and fill it with relative path of files/folders which needs to ignore.

> You can modify `.eslintignore` file based on your requirement. Please consult before modifying.

In `apps\service\src\public\csunit\package.json` file added following script to lint using ESLint:

-   **lint** : Execute linting on local project
-   **lint:fix** : Execute auto fix of ESLint failure on local project
-   **lint:gitlab** : Execute linting on local project using gitlab formatter. It will generate `eslint-gitlab-report.json` file in current working directory which having lint result.

#### Run <a name="run"></a>

Please follow below steps to execute lint in CSUnit project using ESLint:

1. Open a new shell window which has `node.js` support.
2. Navigate to **_creo-saas-backing-services-poc_** local project path.
3. Do further navigation to **_.\apps\service\src\public\csunit_** path.
4. Execute `$ npm install` command.
    > It’s recommended to execute this command whenever you do `git clone / git pull / git merge` operation.
5. Finally execute `$ npm run lint` or `$ npm run lint:gitlab` command based on your requirement.

Example:

```
D:\Users\anath>> cd D:/cloud/creo-saas-backing-services-poc
D:\cloud\creo-saas-backing-services-poc>> cd .\apps\service\src\public\csunit
D:\cloud\creo-saas-backing-services-poc\apps\service\src\public\csunit>> npm install
D:\cloud\creo-saas-backing-services-poc\apps\service\src\public\csunit>> npm run lint
```

> To lint single file, please execute following command:
> `$ npx eslint <file-path-with-name>`
>
> To auto fix single file, execute following command:
> `$ npx eslint --fix <file-path-with-name>`

#### ESLint on gitlab CI/CD pipeline <a name="eslint-on-gitlab-cicd-pipeline"></a>

We also have linting (using ESLint) facility in `gitlab` CI/CD pipeline under `code_quality` stage. Whenever a new merge request is created or code merged to `master` branch, gitlab automatically start linting using ESLint. It will help reviewer to review merged code easily.

![Home page](images/csunit-lint.png)

### References <a name="references"></a>

-   [ESLint - Pluggable JavaScript linter](https://eslint.org/)
-   [ESLint - Rules](https://eslint.org/docs/rules/)
-   [ESLint - Disabling Rules](https://eslint.org/docs/user-guide/configuring/rules#disabling-rules)
-   [TypeScript ESLint - Rules](https://typescript-eslint.io/rules/)
-   [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base)
-   [eslint-formatter-gitlab](https://www.npmjs.com/package/eslint-formatter-gitlab)

## `gitlab` branch <a name="gitlab-branch"></a>

[https://gitlab.rd-services.aws.ptc.com/cc/creo/creo-saas-backing-services-poc/-/tree/csunit](https://gitlab.rd-services.aws.ptc.com/cc/creo/creo-saas-backing-services-poc/-/tree/csunit)
