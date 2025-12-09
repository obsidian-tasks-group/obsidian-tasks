# Homepage - Bases

With Obsidian 1.10.0.

```base
filters:
  and:
    - file.folder == this.file.folder
formulas:
  project status: project.asFile().properties.status
views:
  - type: table
    name: All Notes
    groupBy:
      property: formula.project status
      direction: ASC
    order:
      - file.name
      - project
      - formula.project status
  - type: table
    name: Active Project Notes
    filters:
      and:
        - formula["project status"] == "active"
    groupBy:
      property: formula.project status
      direction: ASC
    order:
      - file.name
      - project
      - formula.project status
  - type: table
    name: Ideas
    filters:
      and:
        - formula["project status"] == "idea"
    groupBy:
      property: formula.project status
      direction: ASC
    order:
      - file.name
      - project
      - formula.project status

```
