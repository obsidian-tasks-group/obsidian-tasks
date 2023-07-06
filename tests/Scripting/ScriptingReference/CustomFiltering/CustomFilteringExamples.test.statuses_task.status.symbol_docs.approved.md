<!-- placeholder to force blank line before included text -->

- ```filter by function task.status.symbol === '-'```
    - Find tasks with a checkbox `[-]`, which is conventionally used to mean "cancelled".
- ```filter by function task.status.symbol !== ' '```
    - Find tasks with anything but the space character as their status symbol, that is, without the checkbox `[ ]`.
- ```filter by function task.status.symbol === 'P' || task.status.symbol === 'C' || task.status.symbol === 'Q' || task.status.symbol === 'A'```
    - Find tasks with status symbol `P`, `C`, `Q` or `A`
    - This can get quite verbose, the more symbols you want to search for..
- ```filter by function 'PCQA'.includes(task.status.symbol)```
    - Find tasks with status symbol `P`, `C`, `Q` or `A`.
    - This is a convenient shortcut over a longer statement testing each allowed value independently.
- ```filter by function !' -x/'.includes(task.status.symbol)```
    - Find tasks with any status symbol not supported by Tasks in the default settings.


<!-- placeholder to force blank line after included text -->
