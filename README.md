# Requirements

- Nodejs version 14+

# Installation

1. Install nodejs

    `sudo apt install nodejs`

    also see: [Using NVM to install latest node version](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04)

2. Install Ionic vue cli

    `npm install -g @ionic/cli`

3. Install His-Core dependancies

    `npm install`

    There is a known issue that happens sometimes due to conflicting dependencies when installing dependencies with npm using node 16+. The following is the error code that is associated with the issue

    ```
    npm ERR! code ERESOLVE
    npm ERR! ERESOLVE could not resolve
    .
    .
    .
    // the rest of the error log
    ```

    As a work around to this run the `npm install` command with the `--legacy-peer-deps` flag.

    ```bash
    npm install --legacy-peer-deps

    // when installing specific packages
    npm install <PACKAGE_NAME_HERE> --legacy-peer-deps
    ```

# API Configuration

1. Rename /public/config.json.example to /public/config.json
2. Change Url, port or host to match API environment

# Running Development App

Run `ionic serve`

# Building for production

## Versioning and Tagging

Open the terminal and run the following to update system version:
```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

eg npm version patch
```

This will update system version and push the new tag to github

### Minimum API Version
You can manually configure the minimum API version by editing package.json and updating
`"min-api-version" : "4.16.1"`

## Building Web version

Run `ionic build`

## Building for Android

To build for Android, make sure you have the latest version of Android studio installed. i.e. version Flamingo | 2022.2.1 or above.
You also need JDK version 17 or above.

1. On the terminal, Run `ionic cap sync`
2. Open Android Studio and click `Build` and then `Generate Signed Bundle or APK`

## Known dependancy issues
# Resolving V-calendar eslint issue
Run `npm i v-calendar@3.0.0-alpha.8 --legacy-peer-deps`

### Known Android build issues
1. `Could not find method compile() for arguments`
- This happens because some of the packages like the barcode scanner are using the `compile` method that is obselete. to fix this in android studio, go to `file > Project Structure > suggestions`.
On the `modules` tab select `app`. then for each warnings with `Obsolete dependency configuration found: compile` click `view usage` then click on `[update compile to implementation]`. click `Ok` to accept the changes.

## Running web version for production
After running `ionic build`, the output files generated are kept in `dist` folder.
You can run the built version using a local web server such as `python3 -m http.server` or use ngx. For optimal serving when testing in development, install `npm install --global serve` and run `serve -s dist`

# Label printer integration from the web browser
Please install this [label script](https://github.com/EGPAFMalawiHIS/Hi-LabelPrinter/tree/master) if you want to print labels from the web.
This is a background service that is compatible with linux operating systems and CAN WORK WITH ANY WEB BROWSER ON THE DESKTOP.
# HIS-Core
