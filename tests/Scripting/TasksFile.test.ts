import { TasksFile } from '../../src/Scripting/TasksFile';

describe('TasksFile', () => {
    it('should provide access to path', () => {
        const path = 'a/b/c/d.md';
        const file = new TasksFile(path);
        expect(file.path).toEqual(path);
    });

    it('should provide access to the root', () => {
        expect(new TasksFile('').root).toStrictEqual('/');
        expect(new TasksFile('outside/inside/A.md').root).toStrictEqual('outside/');
        expect(new TasksFile('a_b/_c_d_/B.md').root).toStrictEqual('a_b/');
        expect(new TasksFile('/root/SeArch_Text/search_text.md').root).toStrictEqual('root/');
    });

    it('should provide access to the folder', () => {
        expect(new TasksFile('').folder).toStrictEqual('/');
        expect(new TasksFile('outside/inside/file.md').folder).toStrictEqual('outside/inside/');
        expect(new TasksFile('a_b/_c_d_/file.md').folder).toStrictEqual('a_b/_c_d_/');
    });

    it('should provide access to the filename', () => {
        expect(new TasksFile('').filename).toEqual('');
        expect(new TasksFile('file in root.md').filename).toEqual('file in root.md');
        expect(new TasksFile('directory name/file in sub-directory.md').filename).toEqual('file in sub-directory.md');
    });
});
