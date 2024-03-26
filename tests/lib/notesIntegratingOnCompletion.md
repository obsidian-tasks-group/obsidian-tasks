- Observation: we only need to handle one task at a time
  - Delete completed instance of task
  - ListEnd - move to end of current list
  - LogList - move to a 'completed tasks' list within current file
  - LogFile - move to an archive file of completed tasks
- Two non-Delete actions work with same note file; one works with a different file
- Question:  Can we use same implementation for all three 'movers'?
- Question:  Where do we call the On Completion code from?
- Question:  Can we use vault.process()?

https://publish.obsidian.md/tasks-contributing/Code/How+does+Tasks+handle+status+changes
https://docs.obsidian.md/Reference/TypeScript+API/Vault/process
https://docs.obsidian.md/Plugins/Vault#Modify+files

```diff
Index: src/Obsidian/File.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/Obsidian/File.ts b/src/Obsidian/File.ts
--- a/src/Obsidian/File.ts	(revision 2decb524c0096df651d8f45baaa8ac9d9a8ff07c)
+++ b/src/Obsidian/File.ts	(date 1711386630621)
@@ -73,6 +73,15 @@
         workspace,
         previousTries: 0,
     });
+
+    const file = vault.getAbstractFileByPath('archive.md');
+    if (file instanceof TFile) {
+        await vault.process(file, (data) => {
+            return data + '\nHello World!';
+        });
+    } else {
+        console.log('Something went wrong...');
+    }
 };

 function errorAndNotice(message: string) {
```

```diff
Index: src/Task/OnCompletion.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/Task/OnCompletion.ts b/src/Task/OnCompletion.ts
--- a/src/Task/OnCompletion.ts	(revision 2decb524c0096df651d8f45baaa8ac9d9a8ff07c)
+++ b/src/Task/OnCompletion.ts	(date 1711387041404)
@@ -18,6 +18,8 @@
         return tasks;
     }

+    // experimentally copy completed task instance to archive.md in vault root
+
     if (taskString.includes('🏁 Delete')) {
         return tasks.filter((task) => task !== changedStatusTask);
     }

```

```diff
Index: src/Task/Task.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/Task/Task.ts b/src/Task/Task.ts
--- a/src/Task/Task.ts	(revision 2decb524c0096df651d8f45baaa8ac9d9a8ff07c)
+++ b/src/Task/Task.ts	(date 1711387040857)
@@ -16,6 +16,7 @@
 import type { TaskLocation } from './TaskLocation';
 import type { Priority } from './Priority';
 import { TaskRegularExpressions } from './TaskRegularExpressions';
+import { handleOnCompletion } from './OnCompletion';

 /**
  * Storage for the task line, broken down in to sections.
@@ -491,8 +492,9 @@
     }

     private putRecurrenceInUsersOrder(newTasks: Task[]) {
+        const potentiallyPrunedTasks = handleOnCompletion(this, newTasks);
         const { recurrenceOnNextLine } = getSettings();
-        return recurrenceOnNextLine ? newTasks.reverse() : newTasks;
+        return recurrenceOnNextLine ? potentiallyPrunedTasks.reverse() : potentiallyPrunedTasks;
     }

     /**

```

// your getting your current code finalised (such as moving the functions out of test files)
// and put in to a new PR,
// which I can then review,
// and we can hopefully get merged before next week....

call an  asynchronous function from a regular function:  https://javascript.info/task/async-from-regular

- copy error handling from 'appendToListWithinFile' to 'writeLineToListEnd'
- separate function to search for heading and return line# -- otherwise handle 'not found'
- use task's own line number to start search for end of current list
-

