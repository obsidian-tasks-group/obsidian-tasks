# Dependencies Samples

## Write the article

- [ ] #task Choose a topic 🆔 ya44g5
- [ ] #task Research the subject 🆔 g7317o ⛔ ya44g5
- [ ] #task Create an outline 🆔 rot7gb ⛔ g7317o
- [ ] #task Develop main points 🆔 mvplec ⛔ rot7gb
- [ ] #task Craft a conclusion 🆔 0wigip ⛔ mvplec
- [ ] #task Proofread and edit 🆔 5ti6bf ⛔ 0wigip
- [ ] #task Publish the article ⛔ 5ti6bf

## Hyphens and underscores allowed

- [ ] #task A task with ID with underscore and hyphen 🆔 Is-A-Valid_ID
- [ ] #task A task that depends on task with ID with underscore and hyphen ⛔ Is-A-Valid_ID

## Multiple dependencies

- [ ] #task Invite the guests 🆔 iv0euw
- [ ] #task Make the food 🆔 rukpy8
- [ ] #task Have a party 🆔 i38dxn ⛔ iv0euw,rukpy8
- [ ] #task Tidy up after party ⛔ i38dxn

## No dependencies

- [ ] #task Do something on a different project

## Problem cases

- [ ] #task Cyclic Dependency 1 🆔 cyclic1 ⛔ cyclic2
- [ ] #task Cyclic Dependency 2 🆔 cyclic2 ⛔ cyclic1
- [ ] #task Depends on a non-existent task ⛔ doesnotexist

---

## Real-world searches

### Blocking and Not Blocked - Do very soon

```tasks
is blocking
is not blocked
# by definition these are all 'not done'

path includes {{query.file.path}}
#explain
```

### Not Blocking and Not Blocked - Do any time

```tasks
is not blocking
is not blocked

# DONE, CANCELLED and NON_TASK are never blocking nor blocked,
# so we need to exclude those:
not done

path includes {{query.file.path}}
#explain
```

### Blocked - Cannot yet do

```tasks
is blocked
# by definition these are all 'not done'

path includes {{query.file.path}}
#explain
```

---

## Demonstration searches - showing the Blocking instructions

### `is blocking` - Blocking Tasks - tasks which prevent others from being done

```tasks
is blocking

path includes {{query.file.path}}
#explain
```

### `is not blocking` - Non-blocking Tasks - Not Done

```tasks
is not blocking
not done

path includes {{query.file.path}}
#explain
```

### `is not blocking` - Non-blocking Tasks - Any Status

```tasks
is not blocking

path includes {{query.file.path}}
#explain
```

---

## Demonstration searches - showing the Blocked instructions

### `is blocked` - Blocked Tasks - tasks which cannot be done yet

```tasks
is blocked

path includes {{query.file.path}}
#explain
```

### `is not blocked` - Non-blocked Tasks - Not Done

```tasks
is not blocked
not done

path includes {{query.file.path}}
#explain
```

### `is not blocked` - Non-blocked Tasks - Any Status

```tasks
is not blocked

path includes {{query.file.path}}
#explain
```

---

## Show/Hide Instructions

### `hide id`

```tasks
hide id
path includes {{query.file.path}}
#explain
```

### `hide depends on`

```tasks
hide depends on
path includes {{query.file.path}}
#explain
```
