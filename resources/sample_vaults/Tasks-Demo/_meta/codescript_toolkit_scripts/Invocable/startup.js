import * as Tasks from '../Tasks.js'
export async function invoke(app) {
    console.log('In invoke()');
    window.Tasks = Tasks;
}

export async function cleanup(app) {
    console.log('In cleanup()');
    delete window.Tasks;
}
