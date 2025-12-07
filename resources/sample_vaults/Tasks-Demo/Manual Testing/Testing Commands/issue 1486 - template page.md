# issue 1486 - template page

Using the `XXX` command....

## Apply repeatedly on initially empty line

<!-- Turn off 
  - MD003/heading-style
  - MD009/no-trailing-spaces
  - MD012/no-multiple-blank
  - MD032/blanks-around-list
-->
<!-- markdownlint-disable MD003 MD009 MD012 MD032 -->

(blank line)





<!-- markdownlint-restore -->

## Apply repeatedly on some plain text

<!-- markdownlint-disable blanks-around-lists -->

test
test
test
test
test

<!-- markdownlint-restore -->

## Apply repeatedly on checkbox with non-standard symbol/status character

- [1] #task test
- [1] #task test
- [1] #task test
- [1] #task test

## Apply repeatedly on different list marker

<!-- markdownlint-disable ul-style -->

+ plus symbol as list marker
+ plus symbol as list marker
+ plus symbol as list marker
+ plus symbol as list marker
+ plus symbol as list marker

<!-- markdownlint-restore -->
