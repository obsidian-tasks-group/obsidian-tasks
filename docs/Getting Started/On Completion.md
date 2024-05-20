---
publish: true  
---  
# On Completion  
> [!tip]  
> If you have ever wished that Tasks would automatically *do something* with the tasks
> that you complete (*especially*  likely if you use [[Recurring Tasks|recurring tasks]], which tend to accumulate within the note that holds them), then the **"On Completion"** feature could be the answer!
## Introduction
> [!released]  
> Introduced in Tasks X.Y.Z.  

Obsidian Tasks can automatically perform an action upon a task when it is marked 'done'.  
  
This feature is enabled by adding (*after* the description within a task) a field consisting of:  
  
- the *checkered flag* signifier 🏁, followed by  
- a string identifying the desired ***Action*** to take when the item is completed.  
  
The following "On Completion" actions are supported:  
  
1. **ToLogList** &nbsp;&nbsp;&nbsp;&nbsp;Move the task to a list of completed tasks **within the *current* note** &nbsp;&nbsp;(default list heading:  "# Completed Tasks")  
2. **ToLogNote** &nbsp;Move the task to **a separate, archival "completed tasks" note** &nbsp;&nbsp;(default filename:  "Completed Tasks.md")  
3. **Delete** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Delete the task**  
  
## Example "On Completion" operations  
  
> [!note]  
> To keep this example simple, the following assumes that **Tasks** is *not* configured to add a `Done` field with current date when you complete a task  
  
Imagine that your vault consists of a single note file "My Project" (`My Project.md`), with these contents:  
  
```text  
# My Project Tasks  
- [ ] Leave me alone  
- [ ] Move me to "# Completed Task Log" **list** within this note 🏁 ToLogList- [ ] Move me to the "Completed Tasks" **note** file 🏁 ToLogFile- [ ] Delete me 🏁 Delete- [ ] Leave me alone too  
```  
  
Using the plugin's default settings, after you *use Tasks* to mark the above tasks as "done", your vault will contain:  
  
Your `My Project` note file:  
  
```text  
# My Project Tasks  
- [x] Leave me alone  
- [x] Leave me alone too  
  
# Completed Tasks  
- [x] Move me to "# Completed Task Log" **list** within this note 🏁 ToLogList```  
  
And a *new* `Completed Tasks` note file (`Completed Tasks.md`):  
  
```text  
# Completed Tasks  
- [x] Move me to the "Completed Tasks" **note** file 🏁 ToLogFile```  
  
> [!note]  
> Since they didn't already exist, Tasks created  
>  
> - the in-note list with the "# Completed Task Log" heading, and  
> - the "Completed Tasks" archive note  
>  
> as you marked Done those tasks that featured On Completion actions that required them.  
```

## Assigning and changing a given task's "On Completion" action  
  
Although the "On Completion" signifier and desired **Action** identifier *can* be added to a task manually, doing so  
might be both tedious and error-prone -- so the **Tasks** plugin provides two ways to add or change each task's  
"On Completion" **Action**.  
  
1. Through the plugin's 'Create or Edit Task' modal dialog.  
2. If a task was previously assigned an "On Completion" **Action**, you can *either* **\[Right-click\]** *or*  
**press-and-hold** the *checkered flag* emoji 🏁 to open a context menu from which you can select another **Action**  
for that task.  
  
## Configuration  
  
### Alternative vault-wide configuration settings  
  
The plugin's vault-wide default values associated with the `On Completion` feature can be changed within **Tasks**' *Configuration* dialog:  
  
- LogNote filepath (Default: "Completed Tasks.md")  
- LogList heading (for in-note list of completed tasks.  Default: "# Completed Tasks")  
- Action (Default: "None")  
  
### Note-specific configuration settings  
  
You can over-ride the vault-wide defaults on a note-by-note basis.  
  
Alternative **Log File** , **Log List Heading**, and/or an `On Completion` **Action** that will *apply to all tasks that **don't** have another **Action** assigned directly*  
can be specified through a note's [*Properties*](https://help.obsidian.md/Editing+and+formatting/Properties) (previously called 'YAML front matter'):  
  
```text  
tasks_oc_logfile:  # example: myfilepath\myfilename.md  
tasks_oc_heading:  # example: "## My Heading" (note: headings _must_ be quoted)  
tasks_oc_action:   # example: LogList  
```  
  
> [!Warning]  
> Take care when setting a note's default Action!  
> Doing so can save a lot of time if you know that you want a majority of your completed tasks to be processed the same  
> way.  
> We recommend thinking twice before setting Delete as the default, as it may be difficult or even impossible to  
> retrieve completed-and-deleted tasks.  
  
## Migrating from other plugins that process "completed tasks"  
  
Prior to the "On Completion" feature being added to Tasks, a few other Obsidian plugins were created to help manage completed  
tasks.  
  
For some, no migration steps will be necessary to update your existing tasks to work with "On Completion". For others, it  
may be both possible and desirable to systematically re-write the tasks in your vault in order to take advantage of this  
new feature.  
  
If and as we learn of resources to facilitate migration from those plugins, we'll provide links below.  
  
- #TODO ***Packrat*** ('insert URI for Packrat repo's "'On Completion' migration page" here')  
  
If you know of any other plugins' migration guides, please [open a New Issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) in our GitHub repo to let us know, and we'll add a link that resource in this section!
