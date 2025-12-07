# issue 1486 - status commands - Obsidian Toggle checkbox status

Using the `Obsidian: Toggle checkbox status` command....

## Apply repeatedly on initially empty line

<!-- markdownlint-disable blanks-around-lists -->

(Empty Line)
- [ ]
- [x]
- [ ]
- [x]

<!-- markdownlint-enable blanks-around-lists -->

## Apply repeatedly on some plain text

<!-- markdownlint-disable blanks-around-lists -->

test
- [ ] test
- [x] test
- [ ] test
- [x] test

<!-- markdownlint-enable blanks-around-lists -->

## Apply repeatedly on checkbox with non-standard symbol/status character

- [1] #task test
- [ ] #task test
- [x] #task test
- [ ] #task test

## Apply repeatedly on different list marker

<!-- markdownlint-disable ul-style -->

+ plus symbol as list marker
+ [ ] plus symbol as list marker
+ [x] plus symbol as list marker
+ [ ] plus symbol as list marker
+ [x] plus symbol as list marker

<!-- markdownlint-enable ul-style -->
