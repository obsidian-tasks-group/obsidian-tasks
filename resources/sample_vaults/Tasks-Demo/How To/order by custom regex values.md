# Order by custom regex values

The new SQL based query engine allows you to create functions to be used in your queries. The example below uses a inline function that parses the description and returns the matched value from the regex. This is used as the value to order by.

- [ ] #task Task one [project::My Cool Project]   [context::call]
- [ ] #task Task two [project::My Cool Project]   [context::shopping]
- [ ] #task Task three [project::My Cool Project]   [context::call]
- [ ] #task Task four [project::My Cool Project]  [context::email]
- [ ] #task Task five [project::My Cool Project]  [context::call]
- [ ] #task Task six [project::My Cool Project]  [context::shopping]
- [ ] #task Task six [project::My Cool Project]

```tasks-sql
CREATE FUNCTION justContext AS ``function(desc) { if(desc) {let matches=desc.match(/\[context::(.*)\]/); if(matches){return matches[1]}} }``;
WHERE description LIKE '%My Cool Project%'
ORDER BY justContext(description)
#ml
#short mode
```
