# Smoke Testing the Edit Task Modal on mobile devices

Extra space is added below the buttons only while Description or a text input has focus, so **Apply** and **Cancel** can scroll clear of the software keyboard. On Android that space follows Obsidian's bottom inset when the inset is taller than the usual allowance, which covers a keyboard with its toolbar and number rows showing.

- [ ] #task On **Android**, enable the Samsung keyboard toolbar and number rows. Open **Tasks: Create or edit task** on an existing task and **Check** that **Apply** and **Cancel** stay visible and reachable while typing in each of these:
    1. Description
    2. a date text field (the calendar control is covered separately below)
    3. Recurrence
    4. **Before this**
    5. **After this**
    6. Close the keyboard, reopen it on Description, and **Check** the buttons are reachable both with the keyboard closed and open again
    7. Switch between portrait and landscape with the keyboard open, and **Check** the buttons stay reachable in both orientations
- [ ] #task With the Android keyboard still open, change the Description, tap **Apply**, and **Check** the task is saved. The keyboard must still have been open when **Apply** was tapped.
- [ ] #task Open the modal again, change the Description, and with the Android keyboard still open tap **Cancel**. **Check** the change is discarded. The keyboard must still have been open when **Cancel** was tapped.
- [ ] #task On **Android** and **iPhone**, focus each of these on its own and **Check** the modal does not add extra space below the buttons for a keyboard that is not open:
    1. the status dropdown
    2. a date field's calendar control
    3. a priority radio button
    4. **Only future dates**
- [ ] #task On **iPhone**, open **Tasks: Create or edit task** and **Check** that the modal opens, Description gains focus, and **Apply** and **Cancel** stay reachable while typing in Description.
- [ ] #task On **desktop**, open **Tasks: Create or edit task**, focus Description, and **Check** that no extra blank space appears below the buttons.
- [ ] #task On mobile, add a CSS snippet containing `.is-mobile .tasks-edit-modal-container { --tasks-keyboard-space-allowance: 120px; }`. Focus Description and **Check** that the space below the buttons follows `120px`. Remove the snippet afterwards.
- [ ] #task **check**: Checked all above steps for **mobile keyboard visibility and dismissal** worked
