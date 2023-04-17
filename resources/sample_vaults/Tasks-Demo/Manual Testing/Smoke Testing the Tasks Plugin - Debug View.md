# Smoke Testing the Tasks Plugin - Debug View

## Purpose

This query shows the tasks in `Smoke Testing the Tasks Plugin.md`, to allow all their debug values to be seen.

This is best used in conjunction with these values in the Tasks debug settings:

```json
"debugSettings": {
  "ignoreSortInstructions": true,
  "showTaskHiddenData": true
}
```

## All tasks in Smoke Testing the Tasks Plugin.md

```tasks
path includes Smoke Testing the Tasks Plugin
# group by heading
# short view
```

Task SQL Query Version

```tasks-sql
WHERE path LIKE '%Smoke Testing the Tasks Plugin%'
#commented out group by heading
#commented out short view
```
