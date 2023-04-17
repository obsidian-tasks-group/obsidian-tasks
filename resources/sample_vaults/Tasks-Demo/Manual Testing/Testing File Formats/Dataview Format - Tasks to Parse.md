# Dataview Format - Tasks to Parse

## 1 Tasks Tasks

- [ ] #task A 1 Some task - with Tasks emoji at end of line 📅2021-08-22
- [ ] #task A 2 Some task - with Tasks emoji in 📅2021-08-22 middle of line - dataview finds the date, Tasks does not

## 2 Dataview Tasks

- [ ] #task B 1 Some task - with dataview square brackets [due:: 2021-08-22]
- [ ] #task B 2 Some task - with dataview parens - which remove rendering of field name (due:: 2021-08-22)
- [ ] #task B 3 Some task - no space after colon - with dataview square brackets [due::2021-08-22]
- [ ] #task B 4 Some task - no space after colon - with dataview parens - which remove rendering of field name (due::2021-08-22)
- [ ] #task B 5 Some task - leading space - no space after colon - with dataview square brackets [  due::2021-08-22]
- [ ] #task B 6 Some task - leading space - no space after colon - with dataview parens - which remove rendering of field name (  due::2021-08-22)
- [ ] #task B 7 Some task - trailing space - no space after colon - with dataview square brackets [due::2021-08-22  ]
- [ ] #task B 8 Some task - trailing space - no space after colon - with dataview parens - which remove rendering of field name (due::2021-08-22  )

## 3 Dataview-like syntax - not bracketed

- [ ] #task C 1 Some task - due value not found by dataview - un-bracketed and 2 colons - due:: 2021-08-22
- [ ] #task C 2 Some task - due value not found by dataview - un-bracketed and 1 colon - due: 2021-08-22
- [ ] #task C 3 Some task - due value not found by dataview - un-bracketed and 0 colons - due 2021-08-22

> [!NOTE] Explanation of why the above `due` text is not parsed by dataview
> **Fields on list items and tasks**
>
> From <https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/>
>
> When you want to annotate a list item, e.g. a task, with metadata, you always need to use the bracket syntax (because the field is not the only information in this line)
>
> `- [ ] Send an mail to David about the deadline [due:: 2022-04-05].`
>
> Bracketed inline fields are the only way to explicitly add fields to specific list items, YAML frontmatter always applies to the whole page (but is also available in context of list items.)

## 4 No due date

- [ ] #task D 1 Some task - with no due date at all
