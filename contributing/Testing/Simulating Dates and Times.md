---
publish: true
---

# Simulating Dates and Times

<span class="related-pages">#testing/automated-testing/dates-and-times</span>

## Simulating times

Most of our date-related tests set a particular simulated 'current date'.

This section shows what to do if you want to set a particular simulated 'current date **and time**'.

<!-- snippet: test-at-different-times -->
```ts
describe('urgency - test time-of-day impact on due-date score', () => {
    // Test to reproduce https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2068
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const task = fromLine({ line: '- [ ] #task 🔽 📅 2023-06-26', path: 'a/b/c.md', precedingHeader: null });

    it.each([
        // Force new line for each time
        ['00:00'],
        ['00:01'],
        ['06:00'],
        ['09:00'],
        ['11:59'],
        ['12:00'],
        ['12:01'],
        ['19:00'],
        ['23:59'],
    ])('with time  "%s"', (time: string) => {
        jest.setSystemTime(new Date('2023-06-26 ' + time));
        expect(Urgency.calculate(task)).toEqual(8.8);
    });
});
```
<!-- endSnippet -->
