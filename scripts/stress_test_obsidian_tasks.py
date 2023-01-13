#!/usr/bin/env python3

# Generate some files containing tasks, to stress-test the Tasks plugin.

import os.path

files_to_write = 50
list_items_to_write = 100
add_task_every_n_lines = 1 # 1 or higher

def file_content(basename: str, file_index: int, number_of_list_items: int) -> str:
    content = ''
    content += f'# {basename}\n\n'
    content += f'## {basename} - level 2\n\n'
    for i in range(1, number_of_list_items + 1):
        line_text = f'#task Set {file_index} Task {i} of {number_of_list_items}'
        if i % add_task_every_n_lines == 0:
            content += f'- [ ] {line_text}\n'
        else:
            content += f'- {line_text}\n'
    return content


def create_files(dir) -> None:
    if not os.path.isdir(dir):
        os.mkdir(dir)
    os.chdir(dir)
    for i in range(1, files_to_write + 1):
        basename = f'tasks-stress-test-{i}'
        filename = f'{basename}.md'
        with open(filename, 'w') as f:
            f.write(file_content(basename, i, list_items_to_write))


if __name__ == '__main__':
    # Run from the root of the vault
    create_files('resources/sample_vaults/Tasks-Demo/Stress Test')
    print('Done')
