import {parentDescription} from '../Tasks.js';
export async function invoke(app) {
    console.log('In invoke()');
    window.Tasks = {parentDescription};
}

export async function cleanup(app) {
    console.log('In cleanup()');
    delete window.Tasks;
}
