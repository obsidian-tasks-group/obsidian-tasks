
# Recurrence handling invalid dates

This file captures some exploratory tests of [issue 1087: Recurrence with 6 months recurs every year](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1087).

## With Tasks 1.14.0

### 1.14.0: every month on the 25th

Each next increment is valid, so it uniformly skips forward each month.

- [ ] #task due at end of month 🔁 every month on the 25th 📅 2022-04-25
- [x] #task due at end of month 🔁 every month on the 25th 📅 2022-03-25 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 25th 📅 2022-02-25 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 25th 📅 2022-01-25 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 25th 📅 2021-12-25 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 25th 📅 2021-11-25 ✅ 2022-10-03

### 1.14.0: every month on the 31st

Some next increments are invalid dates, in which case rrule skips forward to the next month.

- [ ] #task due at end of month 🔁 every month on the 31st 📅 2022-07-31
- [x] #task due at end of month 🔁 every month on the 31st 📅 2022-05-31 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 31st 📅 2022-03-31 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 31st 📅 2022-01-31 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 31st 📅 2021-12-31 ✅ 2022-10-03
- [x] #task due at end of month 🔁 every month on the 31st 📅 2021-11-30 ✅ 2022-10-03

## With #1197

### #1197: every month on the 25th

- [ ] #task due at end of month 🔁 every month on the 25th 📅 2021-11-25

### #1197: every month on the 31st

- [ ] #task due at end of month 🔁 every month on the 31st 📅 2021-11-30
