import moment from 'moment';
import { Status, Task } from '../src/Task';
import { updateSettings, getSettings } from '../src/Settings';

jest.mock('obsidian');
window.moment = moment;

// Constants
const constantTaskOptions = {
  path: 'this/is a path/to a/file.md',
  sectionStart: 1337,
  sectionIndex: 1209,
  precedingHeader: 'Eloquent Section',
}
const constantDatesToTest = [
  '2021-09-12',
  '2021-06-20',
]


function commonAssertions(options) {
  const {task, expectations} = options
  expect(task).not.toBeNull();
  expect(task!.description).toEqual(expectations.description);
  expect(task!.status).toStrictEqual(Status.Done);
  expect(task!.dueDate).not.toBeNull();
  expect(task!.dueDate!.isSame(expectations.dueDate)).toStrictEqual(true);
  expect(task!.doneDate).not.toBeNull();
  expect(task!.doneDate!.isSame(expectations.doneDate)).toStrictEqual(true);
}

for (let i = 0; i < Task.customDateFormats.length; i++) {
  const customDateFormat = Task.customDateFormats[i].format
  const formattedDate1 = moment(constantDatesToTest[0]).format(customDateFormat)
  const formattedDate2 = moment(constantDatesToTest[1]).format(customDateFormat)

  it(`(${customDateFormat}) parses a task from a line`, () => {
      // Arrange & Act
      const line = `- [x] this is a done task 🗓 ${formattedDate1} ✅ ${formattedDate2}`
      const task = Task.fromLine({line,...constantTaskOptions,forcedDateFormat:customDateFormat})
      const expectations = {
        description : 'this is a done task',
        dueDate : moment(formattedDate1, customDateFormat),
        doneDate : moment(formattedDate2, customDateFormat),
      }

      // Assert
      commonAssertions({task, expectations})
  });

  it(`(${customDateFormat}) allows signifier emojis as part of the description`, () => {
      // Arrange & Act
      const line = `- [x] this is a ✅ done task 🗓 ${formattedDate1} ✅ ${formattedDate2}`
      const task = Task.fromLine({line,...constantTaskOptions,forcedDateFormat:customDateFormat})
      const expectations = {
        description : 'this is a ✅ done task',
        dueDate : moment(formattedDate1, customDateFormat),
        doneDate : moment(formattedDate2, customDateFormat),
      }

      // Assert
      commonAssertions({task, expectations})
  })

  it(`(${customDateFormat}) also works with block links and trailing spaces`, () => {
      // Arrange & Act
      const line = `- [x] this is a ✅ done task 🗓 ${formattedDate1} ✅ ${formattedDate2} ^my-precious  `;
      const task = Task.fromLine({line,...constantTaskOptions,forcedDateFormat:customDateFormat})
      const expectations = {
        description : 'this is a ✅ done task',
        dueDate : moment(formattedDate1, customDateFormat),
        doneDate : moment(formattedDate2, customDateFormat),
      }

      // Assert
      commonAssertions({task, expectations})
      expect(task!.blockLink).toEqual(' ^my-precious');
  })
}
