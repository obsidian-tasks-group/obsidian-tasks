# Heading

```tasks
limit 100
description includes [[
# group by function task.outLinks.map(link => link.originalMarkdown)
group by function task.outLinks.map(link => `\\${link.destination}`)
# group by function task.outLinks.map(link => link.displayText)
```

...links.map((link) => prependToValue("link: ", link.destination))

- [ ] highest why isn't this w

group by function task.outLinks.map(link => link.destinationFileName)

[[Project 2]]
[[Project Search]]
