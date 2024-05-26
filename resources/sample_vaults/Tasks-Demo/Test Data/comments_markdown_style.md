# comments_markdown_style

Whole task line is ignored by Obsidian's `cachedMetadata`:
%%
- [ ] #task Whole task in 'comments_markdown_style'
%%

- [ ] #task Whole task in 'comments_markdown_style' - with commented-out tag: %% #i-am-parsed-by-obsidian  %% - is recognised by Obsidian's `cachedMetadata`
- [ ] #task Whole task in 'comments_markdown_style' - with commented-out link: %% [[comments_html_style]]  %% - is recognised by Obsidian's `cachedMetadata`
