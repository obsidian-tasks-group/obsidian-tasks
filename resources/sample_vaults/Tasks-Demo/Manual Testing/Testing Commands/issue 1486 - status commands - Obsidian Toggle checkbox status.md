# issue 1486 - status commands - Obsidian Toggle checkbox status

Using the `Obsidian: Toggle checkbox status` command....

## Apply repeatedly on initially empty line

<!-- Turn off MD009/no-trailing-spaces  MD032/blanks-around-list -->
<!-- markdownlint-disable MD009 MD032 -->

(blank line)
- [ ] 
- [x] 
- [ ] 
- [x] 

<!-- markdownlint-restore -->

## Apply repeatedly on some plain text

<!-- markdownlint-disable blanks-around-lists -->

test
- [ ] test
- [x] test
- [ ] test
- [x] test

<!-- markdownlint-restore -->

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

<!-- markdownlint-restore -->
