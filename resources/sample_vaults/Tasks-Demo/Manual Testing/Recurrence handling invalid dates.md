
# Recurrence handling invalid dates

This file captures some exploratory tests of [issue 1087: Recurrence with 6 months recurs every year](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1087).

## With Tasks 1.14.0

### 1.14.0: every month on the 25th

Each next increment is valid, so it uniformly skips forward each month.

- [ ] #task do stuff 🔁 every month on the 25th 📅 2022-04-25
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-03-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-02-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-01-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2021-12-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2021-11-25 ✅ 2022-10-03

### 1.14.0: every month on the 31st

Some next increments are invalid dates, in which case rrule skips forward to the next month.

- [ ] #task do stuff 🔁 every month on the 31st 📅 2022-07-31
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-05-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-03-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-01-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2021-12-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2021-11-30 ✅ 2022-10-03

### 1.14.0: every month on the last

- [ ] #task do stuff 🔁 every month on the last 📅 2022-04-30
- [x] #task do stuff 🔁 every month on the last 📅 2022-03-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2022-02-28 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2022-01-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2021-12-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2021-11-30 ✅ 2022-10-03

## With #1197

There are two copies of each test here.

- The first will remain unchanged, and is the initial starting point for a recurring task.
- The second shows the most-recently tested behaviour, with a comment describing any issues with that behaviour.

The intention is to make it easy to re-start testing  if testing on a newer version of the plugin,

### #1197: every month on the 25th - starting point

- [ ] #task do stuff 🔁 every month on the 25th 📅 2021-11-25

### #1197: every month on the 25th - current behaviour

This works fine.

- [ ] #task do stuff 🔁 every month on the 25th 📅 2022-04-25
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-03-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-02-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2022-01-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2021-12-25 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 25th 📅 2021-11-25 ✅ 2022-10-03

### #1197: every month on the 31st - starting point

- [ ] #task do stuff 🔁 every month on the 31st 📅 2021-11-30

### #1197: every month on the 31st - current behaviour

Because a specific date has been requested, if the new recurrence lands on an invalid date, it skips forward to the next increment, until a valid due date is reached.

- [ ] #task do stuff 🔁 every month on the 31st 📅 2022-07-31
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-05-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-03-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2022-01-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2021-12-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the 31st 📅 2021-11-30 ✅ 2022-10-03

### #1197: every month on the last - starting point

- [ ] #task do stuff 🔁 every month on the last 📅 2021-11-30

### #1197: every month on the last - current behaviour

- [ ] #task do stuff 🔁 every month on the last 📅 2022-04-30
- [x] #task do stuff 🔁 every month on the last 📅 2022-03-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2022-02-28 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2022-01-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2021-12-31 ✅ 2022-10-03
- [x] #task do stuff 🔁 every month on the last 📅 2021-11-30 ✅ 2022-10-03
