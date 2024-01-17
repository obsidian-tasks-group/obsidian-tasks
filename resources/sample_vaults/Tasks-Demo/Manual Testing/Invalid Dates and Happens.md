# Invalid Dates and Happens

For experimenting with `happens` date with invalid dates. See [issue #2594](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2594).

## 1 Tasks

### 1.1 ==Number of invalid Happens dates: 3==

- [ ] #task 1 all invalid 🛫 2022-02-31 ⏳ 2023-02-31 📅 2024-02-31

### 1.2 ==Number of invalid Happens dates: 2==

- [ ] #task 2.1 starts valid 🛫 2022-02-26 ⏳ 2023-02-31 📅 2024-02-31
- [ ] #task 2.2 scheduled valid 🛫 2022-02-31 ⏳ 2023-02-27 📅 2024-02-31
- [ ] #task 2.3 due valid 🛫 2022-02-31 ⏳ 2023-02-31 📅 2024-02-28

### 1.3 ==Number of invalid Happens dates: 1 - plus 2 valid==

- [ ] #task 3.1 starts invalid - other two provided and valid 🛫 2022-02-31 ⏳ 2023-02-27 📅 2024-02-28
- [ ] #task 3.2 scheduled invalid - other two provided and valid 🛫 2022-02-26 ⏳ 2023-02-31 📅 2024-02-28
- [ ] #task 3.3 due invalid - other two provided and valid 🛫 2022-02-26 ⏳ 2023-02-27 📅 2024-02-31

### 1.4 ==Number of invalid Happens dates: 1 only==

- [ ] #task 4.1 starts invalid 🛫 2022-02-31
- [ ] #task 4.2 scheduled invalid ⏳ 2023-02-31
- [ ] #task 4.3 due invalid 📅 2024-02-31

### 1.5 ==Number of invalid Happens dates: 0==

- [ ] #task 5 all valid 🛫 2022-02-26 ⏳ 2023-02-27 📅 2024-02-28

## 2 Searches

### 2.1 Grouped by happens date

```tasks
group by happens

path includes {{query.file.path}}

show urgency

hide backlinks
```

<!--
### 2.2 Grouped by heading then happens date

```tasks
group by heading
group by happens

path includes {{query.file.path}}

hide backlinks
```
-->
