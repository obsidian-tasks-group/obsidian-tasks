import * as Tasks from '../Tasks.js';
import * as TasksNew from '../TasksNew.ts';

export async function invoke(app) {
    console.log('In invoke()');
    window.Tasks = Tasks;
    window.TasksNew = TasksNew;
}

export async function cleanup(app) {
    console.log('In cleanup()');
    delete window.Tasks;
    delete window.TasksNew;
}
