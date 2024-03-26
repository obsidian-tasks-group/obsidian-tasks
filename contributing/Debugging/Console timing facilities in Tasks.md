---
publish: true
---

# Console timing facilities in Tasks

<span class="related-pages">#profiling</span>

## Using the console timing facility

When you  **edit your Tasks plugin settings to set 'debugSettings > recordTimings' to true**, Tasks will:

 1. measure the elapsed time taken in sections of performance critical code,
 1. write the elapsed time to the console, similar to `console.time()` and `console.timeEnd()`,
 1. add markings to the Timing section of performance flame charts: see 'Performance and profiling' in [[Debugging and Performance tools]].

## Timing new sections of code

The timing facility is implemented in [PerformanceTracker.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/lib/PerformanceTracker.ts).

How to use PerformanceTracker:

```typescript
const tracker = new PerformanceTracker('some descriptive text');
tracker.start();
// ... some slow code
tracker.finish();
```

## Example console output

```text
Search: 4tNIzakiWp - Stress Test/limit 1.md: 131.60000002384186 milliseconds
Render: 4tNIzakiWp - Stress Test/limit 1.md: 26.900000035762787 milliseconds
Search: 63ata8hRM1 - Stress Test/limit 25.md: 89.20000004768372 milliseconds
Render: 63ata8hRM1 - Stress Test/limit 25.md: 32.30000001192093 milliseconds
Search: XxLS3Z3SHT - Stress Test/limit 50.md: 101.10000002384186 milliseconds
Render: XxLS3Z3SHT - Stress Test/limit 50.md: 62.80000001192093 milliseconds
Search: 7T4xmf87Ky - Stress Test/limit 100.md: 108.5 milliseconds
Render: 7T4xmf87Ky - Stress Test/limit 100.md: 165.79999995231628 milliseconds
Search: XngShdTbz3 - Stress Test/limit 150.md: 91.40000003576279 milliseconds
Render: XngShdTbz3 - Stress Test/limit 150.md: 164 milliseconds
Search: aCvrb1aufJ - Stress Test/limit 200.md: 91.10000002384186 milliseconds
Render: aCvrb1aufJ - Stress Test/limit 200.md: 209.89999997615814 milliseconds
```

## Example timing labels in profiling

See [[Debugging and Performance tools#Label sections in performance flame charts]].
