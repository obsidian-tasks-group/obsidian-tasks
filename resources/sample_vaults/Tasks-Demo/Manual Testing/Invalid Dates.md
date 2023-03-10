# Invalid Dates

## Sample Date

### Tasks with valid dates

- [ ] #task Valid created date ➕ 2022-02-28
- [x] #task Valid done date ✅ 2022-02-28
- [ ] #task Valid due date 📅 2022-02-28
- [ ] #task Valid scheduled date ⏳ 2022-02-28
- [ ] #task Valid start date 🛫 2022-02-28

### Tasks with invalid dates

- [ ] #task Invalid created date ➕ 2022-02-29
- [x] #task Invalid done date ✅ 2022-02-29
- [ ] #task Invalid due date 📅 2022-02-29
- [ ] #task Invalid scheduled date ⏳ 2022-02-29
- [ ] #task Invalid start date 🛫 2022-02-29

## Sample Searches

### All tasks in this file

```tasks
path includes Manual Testing/Invalid Dates
group by heading
sort by description
```

### Search for tasks with invalid dates

Tasks that have invalid dates: expect 5 matches.

```tasks
path includes Manual Testing/Invalid Dates
(created date is invalid) OR (done date is invalid) OR (due date is invalid) OR (scheduled date is invalid) OR (start date is invalid)
sort by description
```
