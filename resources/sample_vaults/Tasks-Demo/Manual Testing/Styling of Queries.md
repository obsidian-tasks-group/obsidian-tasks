# Styling of Queries

> [!Warning]
> These tests require the `.has` selector.
> The CSS `:has` selector is available with **Obsidian installer version 1.1.9 and newer**. You can run the Obsidian command `Show debug info` to see your current installer version.

---

To test styling of queries, follow these steps, viewing this file either in **Reading** Mode or **Live Preview** Mode:

- [ ] **1. Open the Obsidian settings of the Demo vault and under Appearance | CSS Snippets, turn on `tasks-plugin-smoke-test-query-styling`.**

- [ ] **2.** **Test 'group by' classes** - the following query result should have **red headings** named 'Priority 1: High' and 'Priority 4: Low'.

```tasks
path includes Styling of Queries
description includes priority
group by priority
```

- [ ] **3. Test 'group by' classes #2** - the following should have a **black** heading named 'No due date':

```tasks
path includes Styling of Queries
description includes priority
group by due
```

- [ ] **4. Test short mode classes** - the following should have an aqua background:

```tasks
path includes Styling of Queries
description includes priority
short mode
```

- [ ] **5. Test 'hidden' query classes** - the following lines should be colored **red**:

```tasks
path includes Styling of Queries
description includes priority
hide priority
hide backlinks
hide urgency
hide edit button
```

- [ ] **6. Test the colouring by tag presence** - this should **show** the description in red, and **show** the tag `#todo/strategic`

```tasks
path includes Styling of Queries
description includes tag
hide backlink
```

- [ ] **7. Test the colouring by tag presence when tags hidden** - this should **show** the description in red, and **hide** the tag `#todo/strategic`

```tasks
path includes Styling of Queries
description includes tag
hide tags
hide backlink
```

- [ ] **8. Open the Obsidian settings** of the Demo vault and under Appearance | CSS Snippets, turn **off** `tasks-plugin-smoke-test-query-styling`.

## Tasks for Reference

- [ ] #task Task with high priority ⏫
- [ ] #task Task with low priority 🔽
- [ ] #task I have a tag to make my description red #todo/strategic
