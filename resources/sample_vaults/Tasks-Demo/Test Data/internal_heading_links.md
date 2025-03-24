# Internal Heading Links Test

This file contains test cases for internal heading links in tasks.

## Simple Headers

## Another Header

## Basic Internal Links

- [ ] #task Task with<br>[[#Basic Internal Links]]

## Multiple Links In One Task

- [ ] #task Task with<br>[[#Multiple Links In One Task]] and<br>[[#Simple Headers]]

## External File Links

- [ ] #task Task with<br>[[Other File]]

## Mixed Link Types

- [ ] #task Task with<br>[[Other File]] and<br>[[#Mixed Link Types]]

## Header Links With File Reference

- [ ] #task<br>[[#Header Links With File Reference]] then<br>[[Other File#Some Header]] and<br>[[#Another Header]]

## Headers-With_Special Characters

- [ ] #task Task with<br>[[#Headers-With_Special Characters]]

## Aliased Links

- [ ] #task Task with<br>[[#Aliased Links|I am an alias]]

## Links In Code Blocks

- [ ] #task Task with `[[#Links In Code Blocks]]` code block

## Escaped Links

- [ ] #task Task with \[\[#Escaped Links\]\] escaped link

## Search

Hover over each heading in these tasks, and to make the Page Preview plugin show that the links exist.

```tasks
path includes {{query.file.path}}
group by heading
hide backlinks
```
