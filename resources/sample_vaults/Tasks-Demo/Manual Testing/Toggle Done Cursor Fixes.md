# Testing issues related to cursor movement in for ToggleDone

GitHub issues 449, 460, and perhaps others.

For each line, put the cursor between the `>>` if one is present or anywhere in the line otherwise and run "Task: Toggle Done". Then undo.
At least once for each subsection do an additional run with the cursor starting at the end of the line.

## Toggle Task Done on `[\s\t>]* wibble` produces `"$1- wibble"` Issue: #460 if the line is blank

%% DO NOT FORGET BLANK LINE %%

>>
wibble
>> wibble

## Toggle Task Done on `[\s\t>]*- wibble` produces `"$1- [ ] wibble"`

- w

>> - wibble

## Toggle Task Done on  `[\s\t>]*- [ ] Wibble` with global filter not present produces  `[\s\t>]*- [x] Wibble`

- [ ] w

>> - [ ] wibble

## Toggle Task Done on `[\s\t>]*- [ ] Wibble` with global filter present or disabled produces  `[\s\t>]*- [x] Wibble ✅ YYYY-MM-DD`. Adds 13 chars. Current behavior has cursor move right 13 characters, regardless of start position. Issue #449

- [ ] #task w

>> - [ ] #task wibble

## Toggle Task Done on  `[\s\t>]*- [x] Wibble ✅ YYYY-MM-DD` with global filter present or disabled produces  `[\s\t>]*- [ ] Wibble`. Removes 13 chars

- [x] #task wibble ✅ 2022-09-02

>> - [x] #task wibble ✅ 2022-09-02

## Toggle Task Done on  `[\s\t>]*- [ ] Wibble 🔁 every day` with global filter present or disabled produces  `[\s\t>]*- [ ] Wibble 🔁 every day\n- [ ] Wibble 🔁 every day ✅ YYYY-MM-DD`. Adds a repeated version of the line at the beginning and 13 chars at end

- [ ] #task wibble 🔁 every day

>> - [ ] #task wibble 🔁 every day
