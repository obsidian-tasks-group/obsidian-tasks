# Chaining links together

## Chaining links together in 'group by' instructions

```tasks
filename includes chain_link

# TODO Make 'group by' detect if the object is a link, and group by its markdown

group by function 'Level 1 link: ' + \
    task.file.\
        propertyAsLink('link_to_file').markdown

group by function 'Level 2 link: ' + \
    task.file.\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').markdown

group by function 'Level 3 link: ' + \
    task.file.\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').markdown

group by function 'Level 4 link: ' + \
    task.file.\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').asFile().\
        propertyAsLink('link_to_file').markdown

```
