# issue 1486 - status commands - 3 Tasks Toggle task done - with global filter

Using the `Tasks: Toggle task done` command **with a global filter `#task`**....

## Apply repeatedly on initially empty line

<!-- Turn off 
  - MD003/heading-style
  - MD009/no-trailing-spaces
  - MD012/no-multiple-blank
  - MD032/blanks-around-list
-->
<!-- markdownlint-disable MD003 MD009 MD012 MD032 -->

(blank line)
- 
- [ ] 
- [x] 
- [ ] 

<!-- markdownlint-restore -->

## Apply repeatedly on some plain text

<!-- markdownlint-disable blanks-around-lists -->

test
- test
- [ ] test
- [x] test
- [ ] test

<!-- markdownlint-restore -->

## Apply repeatedly on some plain text with the global filter

<!-- markdownlint-disable blanks-around-lists -->

test #task
- test #task
- [ ] test #task
- [x] test #task ✅ 2025-12-07
- [ ] test #task

<!-- markdownlint-restore -->

## Apply repeatedly on checkbox with non-standard symbol/status character

- [1] #task test
- [2] #task test
- [3] #task test ✅ 2025-12-07
- [1] #task test
- [2] #task test
- [3] #task test ✅ 2025-12-07

## Apply repeatedly on different list marker

<!-- markdownlint-disable ul-style -->

Note that this wrongly changes the list marker from `+` to `-`, in Tasks 7.22.0.

+ plus symbol as list marker
+ [ ] plus symbol as list marker

- [x] plus symbol as list marker
- [ ] plus symbol as list marker
- [x] plus symbol as list marker

<!-- markdownlint-restore -->
