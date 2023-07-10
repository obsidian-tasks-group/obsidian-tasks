<!-- placeholder to force blank line before included text -->

- ```filter by function task.file.folder === "Work/Projects/"```
    - Find tasks in files in any file in the given folder **only**, and not any sub-folders.
    - The equality test, `===`, requires that the trailing slash (`/`) be included.
- ```filter by function task.file.folder.includes("Work/Projects/")```
    - Find tasks in files in any folder **and any sub-folders**.
- ```filter by function task.file.folder.includes("Work/Projects")```
    - By leaving off the trailing slash (`/`) this would also find tasks in any file inside folders such as:
        - `Work/Projects 2023/`
        - `Work/Projects Top Secret/`


<!-- placeholder to force blank line after included text -->
