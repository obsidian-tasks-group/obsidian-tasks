# Dependencies Samples

- [ ] #task Choose a topic 🆔 ya44g5
- [ ] #task Research the subject ⛔️ ya44g5 🆔 g7317o
- [ ] #task Create an outline ⛔️ g7317o 🆔 rot7gb
- [ ] #task Develop main points ⛔️ rot7gb 🆔 mvplec
- [ ] #task Craft a conclusion ⛔️ mvplec 🆔 0wigip
- [ ] #task Proofread and edit ⛔️ 0wigip 🆔 5ti6bf
- [ ] #task Publish the article ⛔️ 5ti6bf

---

## Do Next

```tasks
((is blocking) AND (is not blocked)) OR (is not blocked)
not done

path includes {{query.file.path}}
explain
```

---

## Blocking Tasks

### Blocking Tasks - Any Status

```tasks
is blocking

path includes {{query.file.path}}
explain
```

### Blocking Tasks - Not Done

```tasks
is blocking
not done

path includes {{query.file.path}}
explain
```

---

## Blocked Tasks

### Blocked Tasks  - Any Status

```tasks
is not blocked

path includes {{query.file.path}}
explain
```

### Blocked Tasks  - Not Done

```tasks
is not blocked
not done

path includes {{query.file.path}}
explain
```

---

## Show/Hide Instructions

### Hide Id

```tasks
hide id
path includes {{query.file.path}}
explain
```

### Hide blockedBy

```tasks
hide depends on
path includes {{query.file.path}}
explain
```
