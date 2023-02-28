# How do I test a GitHub build of the Tasks plugin?

First...

1. Go to the [Verify Commit actions page](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/verify.yml).
2. Click on the build of the code version you want to test. For example, you might click on the build for a particular pull request, or the most recent build on `main`.

Then do one of the following options...

## Option 1: Download Tasks-Demo test vault with the build's Tasks plugin installed

1. In the Artifacts section at the bottom, click on the link whose name starts with **Tasks-Demo-...**, for example  **Tasks-Demo-VerifyCommit-Build1367-Run1**.
    - This will download a zip file containing a copy of the Tasks-Demo sample vault, including the build of the plugin.
    - The numbers in the file name will vary.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the zip file.
    - It will create a folder of the same name.
4. Open the expanded folder in Obsidian:
    - Open Obsidian
    - Click 'Open another vault' button
    - Click 'Open folder as vault' button
    - Navigate to the downloaded folder
    - Click 'Open'

## Option 2: Download the built plugin to add to your vault

You can use these steps to install the built plugin either in to the Tasks-Demo vault inside a clone of the [obsidian-tasks repo](https://github.com/obsidian-tasks-group/obsidian-tasks) or in to one of your own vaults.

1. In the Artifacts section at the bottom, click on **dist-verified** to download a build of the plugin.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the downloaded zip file
4. Copy the files in the expanded folder to the `.obsidian/plugins/obsidian-tasks-plugin/` folder in your vault, over-writing the previous files.
5. Restart Obsidian.
