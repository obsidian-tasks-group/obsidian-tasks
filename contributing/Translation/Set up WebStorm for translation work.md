---
publish: true
---

# Set up WebStorm for translation work

<span class="related-pages">#i18n #tools/webstorm </span>

> [!Info]
> This page was last updated when using:
>
> - WebStorm version 2026.1.3
> - Easy I18n version 5.0.2

## Set up the Easy I18n WebStorm plugin

1. Install the [Easy I18n](https://plugins.jetbrains.com/plugin/16316-easy-i18n) plugin.
2. Configure it: Copy the following content in to `obsidian-tasks/.idea/easy-i18n.xml`.

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project version="4">
      <component name="ProjectConfigService">
        <option name="keyComment" value="false" />
        <option name="sorting" value="true" />
        <option name="previewLocale" value="en" />
        <option name="modules">
          <map>
            <entry key="frontend">
              <value>
                <ProjectConfigModuleState>
                  <option name="id" value="frontend" />
                  <option name="pathTemplate" value="$PROJECT_DIR$/src/i18n/locales/{locale}.json" />
                  <option name="fileCodec" value="JSON" />
                  <option name="fileTemplate" value="[{fileKey}]" />
                  <option name="keyTemplate" value="{fileKey:.}" />
                  <option name="rootDirectory" value="$PROJECT_DIR$/src" />
                  <option name="defaultKeyPrefixes">
                    <set />
                  </option>
                  <option name="editorFlavorTemplate" value="i18n.t" />
                  <option name="editorRules">
                    <list />
                  </option>
                </ProjectConfigModuleState>
              </value>
            </entry>
          </map>
        </option>
      </component>
    </project>
    ```

3. Restart WebStorm.
4. Check that the settings look like this:

    ![Screenshot showing WebStorm Easy I18n plugin settings](WebStorm%20Easy%20I18n%20plugin%20settings.png)
    <span class="caption">Screenshot showing WebStorm Easy I18n plugin settings</span>

## Using the Easy I18n WebStorm plugin

To do:

- Action for extracting strings
- Table and tree view
  - Meaning of red text
  - Meaning of orange text
