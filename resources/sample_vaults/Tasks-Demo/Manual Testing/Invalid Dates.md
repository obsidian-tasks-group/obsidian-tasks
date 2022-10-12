# Invalid Dates

## Sample Date

### Tasks with valid dates

- [x] #task Valid done date ✅ 2022-02-28
- [ ] #task Valid due date 📅 2022-02-28
- [ ] #task Valid scheduled date ⏳ 2022-02-28
- [ ] #task Valid start date 🛫 2022-02-28

### Tasks with invalid dates

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

Tasks that have invalid dates: expect 4 matches.

```tasks
path includes Manual Testing/Invalid Dates
(done date is invalid) OR (due date is invalid) OR (scheduled date is invalid) OR (start date is invalid)
sort by description
```
