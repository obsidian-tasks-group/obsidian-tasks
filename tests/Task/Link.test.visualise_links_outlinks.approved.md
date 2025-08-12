## Test Data/all_link_types.md

`link.originalMarkdown     `: `'[markdownLink](markdownLink.md)'`
`link.markdown             `: `'[markdownLink](markdownLink.md)'`
`link.destination          `: `'markdownLink.md'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink'`

`link.originalMarkdown     `: `'[markdownLink with alias](markdownLink.md)'`
`link.markdown             `: `'[markdownLink with alias](markdownLink.md)'`
`link.destination          `: `'markdownLink.md'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink with alias'`

`link.originalMarkdown     `: `'[[wikilink]]'`
`link.markdown             `: `'[[wikilink]]'`
`link.destination          `: `'wikilink'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink'`

`link.originalMarkdown     `: `'[[wikilink|wikilink with alias]]'`
`link.markdown             `: `'[[wikilink|wikilink with alias]]'`
`link.destination          `: `'wikilink'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink with alias'`

`link.originalMarkdown     `: `'[[#heading]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#heading|heading]]'`
`link.destination          `: `'#heading'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'heading'`

`link.originalMarkdown     `: `'[[#heading|internal wikilink with alias and heading]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#heading|internal wikilink with alias and heading]]'`
`link.destination          `: `'#heading'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'internal wikilink with alias and heading'`

`link.originalMarkdown     `: `'[[#heading#sub-heading]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#heading#sub-heading|heading > sub-heading]]'`
`link.destination          `: `'#heading#sub-heading'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'heading > sub-heading'`

`link.originalMarkdown     `: `'[[#heading#sub-heading||internal wikilink with alias and two headings]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#heading#sub-heading||internal wikilink with alias and two headings]]'`
`link.destination          `: `'#heading#sub-heading'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'|internal wikilink with alias and two headings'`

`link.originalMarkdown     `: `'[[wikilink#heading]]'`
`link.markdown             `: `'[[wikilink#heading]]'`
`link.destination          `: `'wikilink#heading'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink > heading'`

`link.originalMarkdown     `: `'[[wikilink#heading|wikilink with alias and heading]]'`
`link.markdown             `: `'[[wikilink#heading|wikilink with alias and heading]]'`
`link.destination          `: `'wikilink#heading'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink with alias and heading'`

`link.originalMarkdown     `: `'[[wikilink#heading#sub-heading]]'`
`link.markdown             `: `'[[wikilink#heading#sub-heading]]'`
`link.destination          `: `'wikilink#heading#sub-heading'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink > heading > sub-heading'`

`link.originalMarkdown     `: `'[[wikilink#heading#sub-heading|wikilink with alias and two headings]]'`
`link.markdown             `: `'[[wikilink#heading#sub-heading|wikilink with alias and two headings]]'`
`link.destination          `: `'wikilink#heading#sub-heading'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink with alias and two headings'`

`link.originalMarkdown     `: `'[markdownLink](markdownLink.md#heading)'`
`link.markdown             `: `'[markdownLink](markdownLink.md#heading)'`
`link.destination          `: `'markdownLink.md#heading'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink'`

`link.originalMarkdown     `: `'[markdownLink with alias and heading](markdownLink.md#heading)'`
`link.markdown             `: `'[markdownLink with alias and heading](markdownLink.md#heading)'`
`link.destination          `: `'markdownLink.md#heading'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink with alias and heading'`

`link.originalMarkdown     `: `'[markdownLink](markdownLink.md#heading#sub-heading)'`
`link.markdown             `: `'[markdownLink](markdownLink.md#heading#sub-heading)'`
`link.destination          `: `'markdownLink.md#heading#sub-heading'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink'`

`link.originalMarkdown     `: `'[markdownLink with alias and two headings](markdownLink.md#heading#sub-heading)'`
`link.markdown             `: `'[markdownLink with alias and two headings](markdownLink.md#heading#sub-heading)'`
`link.destination          `: `'markdownLink.md#heading#sub-heading'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink with alias and two headings'`

`link.originalMarkdown     `: `'[[#^block]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#^block|^block]]'`
`link.destination          `: `'#^block'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'^block'`

`link.originalMarkdown     `: `'[[#^block|wikilink with alias and block]]'`
`link.markdown             `: `'[[Test Data/all_link_types.md#^block|wikilink with alias and block]]'`
`link.destination          `: `'#^block'`
`link.destinationPath      `: `'Test Data/all_link_types.md'`
`link.displayText          `: `'wikilink with alias and block'`

`link.originalMarkdown     `: `'[[wikilink#^block]]'`
`link.markdown             `: `'[[wikilink#^block]]'`
`link.destination          `: `'wikilink#^block'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink > ^block'`

`link.originalMarkdown     `: `'[[wikilink#^block|wikilink with alias and block]]'`
`link.markdown             `: `'[[wikilink#^block|wikilink with alias and block]]'`
`link.destination          `: `'wikilink#^block'`
`link.destinationPath      `: `'Test Attachments/wikilink.md'`
`link.displayText          `: `'wikilink with alias and block'`

`link.originalMarkdown     `: `'[markdownLink](markdownLink.md#^block)'`
`link.markdown             `: `'[markdownLink](markdownLink.md#^block)'`
`link.destination          `: `'markdownLink.md#^block'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink'`

`link.originalMarkdown     `: `'[markdownLink with alias and block](markdownLink.md#^block)'`
`link.markdown             `: `'[markdownLink with alias and block](markdownLink.md#^block)'`
`link.destination          `: `'markdownLink.md#^block'`
`link.destinationPath      `: `'Test Attachments/markdownLink.md'`
`link.displayText          `: `'markdownLink with alias and block'`

## Test Data/comments_markdown_style.md

`link.originalMarkdown     `: `'[[comments_html_style]]'`
`link.markdown             `: `'[[comments_html_style]]'`
`link.destination          `: `'comments_html_style'`
`link.destinationPath      `: `'Test Data/comments_html_style.md'`
`link.displayText          `: `'comments_html_style'`

## Test Data/docs_sample_for_task_properties_reference.md

`link.originalMarkdown     `: `'[[yaml_all_property_types_populated]]'`
`link.markdown             `: `'[[yaml_all_property_types_populated]]'`
`link.destination          `: `'yaml_all_property_types_populated'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_populated.md'`
`link.displayText          `: `'yaml_all_property_types_populated'`

`link.originalMarkdown     `: `'[[yaml_all_property_types_populated]]'`
`link.markdown             `: `'[[yaml_all_property_types_populated]]'`
`link.destination          `: `'yaml_all_property_types_populated'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_populated.md'`
`link.displayText          `: `'yaml_all_property_types_populated'`

`link.originalMarkdown     `: `'[[yaml_all_property_types_empty]]'`
`link.markdown             `: `'[[yaml_all_property_types_empty]]'`
`link.destination          `: `'yaml_all_property_types_empty'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_empty.md'`
`link.displayText          `: `'yaml_all_property_types_empty'`

## Test Data/internal_heading_links.md

`link.originalMarkdown     `: `'[[#Basic Internal Links]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]'`
`link.destination          `: `'#Basic Internal Links'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Basic Internal Links'`

`link.originalMarkdown     `: `'[[#Multiple Links In One Task]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Multiple Links In One Task|Multiple Links In One Task]]'`
`link.destination          `: `'#Multiple Links In One Task'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Multiple Links In One Task'`

`link.originalMarkdown     `: `'[[#Simple Headers]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Simple Headers|Simple Headers]]'`
`link.destination          `: `'#Simple Headers'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Simple Headers'`

`link.originalMarkdown     `: `'[[Other File]]'`
`link.markdown             `: `'[[Other File]]'`
`link.destination          `: `'Other File'`
`link.destinationPath      `: `'Manual Testing/Internal Heading Links/Other File.md'`
`link.displayText          `: `'Other File'`

`link.originalMarkdown     `: `'[[Other File]]'`
`link.markdown             `: `'[[Other File]]'`
`link.destination          `: `'Other File'`
`link.destinationPath      `: `'Manual Testing/Internal Heading Links/Other File.md'`
`link.displayText          `: `'Other File'`

`link.originalMarkdown     `: `'[[#Mixed Link Types]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Mixed Link Types|Mixed Link Types]]'`
`link.destination          `: `'#Mixed Link Types'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Mixed Link Types'`

`link.originalMarkdown     `: `'[[#Header Links With File Reference]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Header Links With File Reference|Header Links With File Reference]]'`
`link.destination          `: `'#Header Links With File Reference'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Header Links With File Reference'`

`link.originalMarkdown     `: `'[[Other File#Some Header]]'`
`link.markdown             `: `'[[Other File#Some Header]]'`
`link.destination          `: `'Other File#Some Header'`
`link.destinationPath      `: `'Manual Testing/Internal Heading Links/Other File.md'`
`link.displayText          `: `'Other File > Some Header'`

`link.originalMarkdown     `: `'[[#Another Header]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Another Header|Another Header]]'`
`link.destination          `: `'#Another Header'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Another Header'`

`link.originalMarkdown     `: `'[[#Headers-With_Special Characters]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Headers-With_Special Characters|Headers-With_Special Characters]]'`
`link.destination          `: `'#Headers-With_Special Characters'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'Headers-With_Special Characters'`

`link.originalMarkdown     `: `'[[#Aliased Links|I am an alias]]'`
`link.markdown             `: `'[[Test Data/internal_heading_links.md#Aliased Links|I am an alias]]'`
`link.destination          `: `'#Aliased Links'`
`link.destinationPath      `: `'Test Data/internal_heading_links.md'`
`link.displayText          `: `'I am an alias'`

## Test Data/link_in_file_body.md

`link.originalMarkdown     `: `'[[yaml_tags_is_empty]]'`
`link.markdown             `: `'[[yaml_tags_is_empty]]'`
`link.destination          `: `'yaml_tags_is_empty'`
`link.destinationPath      `: `'Test Data/yaml_tags_is_empty.md'`
`link.displayText          `: `'yaml_tags_is_empty'`

## Test Data/link_in_file_body_with_custom_display_text.md

`link.originalMarkdown     `: `'[[yaml_tags_is_empty|a file and use custom display text]]'`
`link.markdown             `: `'[[yaml_tags_is_empty|a file and use custom display text]]'`
`link.destination          `: `'yaml_tags_is_empty'`
`link.destinationPath      `: `'Test Data/yaml_tags_is_empty.md'`
`link.displayText          `: `'a file and use custom display text'`

## Test Data/link_in_heading.md

`link.originalMarkdown     `: `'[[multiple_headings]]'`
`link.markdown             `: `'[[multiple_headings]]'`
`link.destination          `: `'multiple_headings'`
`link.destinationPath      `: `'Test Data/multiple_headings.md'`
`link.displayText          `: `'multiple_headings'`

## Test Data/link_in_task_markdown_link.md

`link.originalMarkdown     `: `'[jason_properties](jason_properties.md)'`
`link.markdown             `: `'[jason_properties](jason_properties.md)'`
`link.destination          `: `'jason_properties.md'`
`link.destinationPath      `: `'Test Data/jason_properties.md'`
`link.displayText          `: `'jason_properties'`

`link.originalMarkdown     `: `'[multiple_headings](multiple_headings.md)'`
`link.markdown             `: `'[multiple_headings](multiple_headings.md)'`
`link.destination          `: `'multiple_headings.md'`
`link.destinationPath      `: `'Test Data/multiple_headings.md'`
`link.displayText          `: `'multiple_headings'`

`link.originalMarkdown     `: `'[link_in_task_markdown_link](link_in_task_markdown_link.md)'`
`link.markdown             `: `'[link_in_task_markdown_link](link_in_task_markdown_link.md)'`
`link.destination          `: `'link_in_task_markdown_link.md'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'link_in_task_markdown_link'`

`link.originalMarkdown     `: `'[link_in_task_markdown_link](Test%20Data/link_in_task_markdown_link.md)'`
`link.markdown             `: `'[link_in_task_markdown_link](Test%20Data/link_in_task_markdown_link.md)'`
`link.destination          `: `'Test Data/link_in_task_markdown_link.md'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'link_in_task_markdown_link'`

`link.originalMarkdown     `: `'[heading_link](Test%20Data/link_in_task_markdown_link.md#heading)'`
`link.markdown             `: `'[heading_link](Test%20Data/link_in_task_markdown_link.md#heading)'`
`link.destination          `: `'Test Data/link_in_task_markdown_link.md#heading'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'heading_link'`

`link.originalMarkdown     `: `'[alias](link_in_task_markdown_link.md)'`
`link.markdown             `: `'[alias](link_in_task_markdown_link.md)'`
`link.destination          `: `'link_in_task_markdown_link.md'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'alias'`

`link.originalMarkdown     `: `'[alias](Test%20Data/link_in_task_markdown_link.md)'`
`link.markdown             `: `'[alias](Test%20Data/link_in_task_markdown_link.md)'`
`link.destination          `: `'Test Data/link_in_task_markdown_link.md'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'alias'`

`link.originalMarkdown     `: `'[link_in_task_markdown_link](pa#th/path/link_in_task_markdown_link.md)'`
`link.markdown             `: `'[link_in_task_markdown_link](pa#th/path/link_in_task_markdown_link.md)'`
`link.destination          `: `'pa#th/path/link_in_task_markdown_link.md'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'link_in_task_markdown_link'`

`link.originalMarkdown     `: `'[heading](#heading)'`
`link.markdown             `: `'[[Test Data/link_in_task_markdown_link.md#heading|heading]]'`
`link.destination          `: `'#heading'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'heading'`

`link.originalMarkdown     `: `'[link_in_task_markdown_link](link_in_task_markdown_link)'`
`link.markdown             `: `'[link_in_task_markdown_link](link_in_task_markdown_link)'`
`link.destination          `: `'link_in_task_markdown_link'`
`link.destinationPath      `: `'Test Data/link_in_task_markdown_link.md'`
`link.displayText          `: `'link_in_task_markdown_link'`

`link.originalMarkdown     `: `'[a_pdf_file](a_pdf_file.pdf)'`
`link.markdown             `: `'[a_pdf_file](a_pdf_file.pdf)'`
`link.destination          `: `'a_pdf_file.pdf'`
`link.destinationPath      `: `'Test Attachments/a_pdf_file.pdf'`
`link.displayText          `: `'a_pdf_file'`

`link.originalMarkdown     `: `'[spaces everywhere](Manual%20Testing/Smoke%20Testing%20the%20Tasks%20Plugin#How%20the%20tests%20work)'`
`link.markdown             `: `'[spaces everywhere](Manual%20Testing/Smoke%20Testing%20the%20Tasks%20Plugin#How%20the%20tests%20work)'`
`link.destination          `: `'Manual Testing/Smoke Testing the Tasks Plugin#How the tests work'`
`link.destinationPath      `: `'Manual Testing/Smoke Testing the Tasks Plugin.md'`
`link.displayText          `: `'spaces everywhere'`

## Test Data/link_in_task_wikilink.md

`link.originalMarkdown     `: `'[[link_in_task_wikilink]]'`
`link.markdown             `: `'[[link_in_task_wikilink]]'`
`link.destination          `: `'link_in_task_wikilink'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'link_in_task_wikilink'`

`link.originalMarkdown     `: `'[[multiple_headings]]'`
`link.markdown             `: `'[[multiple_headings]]'`
`link.destination          `: `'multiple_headings'`
`link.destinationPath      `: `'Test Data/multiple_headings.md'`
`link.displayText          `: `'multiple_headings'`

`link.originalMarkdown     `: `'[[Test Data/link_in_task_wikilink]]'`
`link.markdown             `: `'[[Test Data/link_in_task_wikilink]]'`
`link.destination          `: `'Test Data/link_in_task_wikilink'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'Test Data/link_in_task_wikilink'`

`link.originalMarkdown     `: `'[[Test Data/link_in_task_wikilink#heading_link]]'`
`link.markdown             `: `'[[Test Data/link_in_task_wikilink#heading_link]]'`
`link.destination          `: `'Test Data/link_in_task_wikilink#heading_link'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'Test Data/link_in_task_wikilink > heading_link'`

`link.originalMarkdown     `: `'[[link_in_task_wikilink|alias]]'`
`link.markdown             `: `'[[link_in_task_wikilink|alias]]'`
`link.destination          `: `'link_in_task_wikilink'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'alias'`

`link.originalMarkdown     `: `'[[Test Data/link_in_task_wikilink|alias]]'`
`link.markdown             `: `'[[Test Data/link_in_task_wikilink|alias]]'`
`link.destination          `: `'Test Data/link_in_task_wikilink'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'alias'`

`link.originalMarkdown     `: `'[[pa#th/path/link_in_task_wikilink]]'`
`link.markdown             `: `'[[pa#th/path/link_in_task_wikilink]]'`
`link.destination          `: `'pa#th/path/link_in_task_wikilink'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'pa > th/path/link_in_task_wikilink'`

`link.originalMarkdown     `: `'[[link_in_task_wikilink.md]]'`
`link.markdown             `: `'[[link_in_task_wikilink.md]]'`
`link.destination          `: `'link_in_task_wikilink.md'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'link_in_task_wikilink.md'`

`link.originalMarkdown     `: `'[[a_pdf_file.pdf]]'`
`link.markdown             `: `'[[a_pdf_file.pdf]]'`
`link.destination          `: `'a_pdf_file.pdf'`
`link.destinationPath      `: `'Test Attachments/a_pdf_file.pdf'`
`link.displayText          `: `'a_pdf_file.pdf'`

`link.originalMarkdown     `: `'[[|]]'`
`link.markdown             `: `'[[|]]'`
`link.destination          `: `'|'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'|'`

`link.originalMarkdown     `: `'[[|alias]]'`
`link.markdown             `: `'[[|alias]]'`
`link.destination          `: `'|alias'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'|alias'`

`link.originalMarkdown     `: `'[[|#alias]]'`
`link.markdown             `: `'[[|#alias]]'`
`link.destination          `: `'|#alias'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'| > alias'`

## Test Data/link_in_task_wikilink_different_case.md

`link.originalMarkdown     `: `'[[liNk_in_YaMl]]'`
`link.markdown             `: `'[[liNk_in_YaMl]]'`
`link.destination          `: `'liNk_in_YaMl'`
`link.destinationPath      `: `'Test Data/link_in_yaml.md'`
`link.displayText          `: `'liNk_in_YaMl'`

## Test Data/link_in_yaml.md

`link.originalMarkdown     `: `'[[yaml_tags_is_empty]]'`
`link.markdown             `: `'[[yaml_tags_is_empty]]'`
`link.destination          `: `'yaml_tags_is_empty'`
`link.destinationPath      `: `'Test Data/yaml_tags_is_empty.md'`
`link.displayText          `: `'yaml_tags_is_empty'`

## Test Data/link_is_broken.md

`link.originalMarkdown     `: `'[[broken link - do not fix me]]'`
`link.markdown             `: `'[[broken link - do not fix me]]'`
`link.destination          `: `'broken link - do not fix me'`
`link.destinationPath      `: `'null'`
`link.displayText          `: `'broken link - do not fix me'`

## Test Data/links_everywhere.md

`link.originalMarkdown     `: `'[[link_in_yaml]]'`
`link.markdown             `: `'[[link_in_yaml]]'`
`link.destination          `: `'link_in_yaml'`
`link.destinationPath      `: `'Test Data/link_in_yaml.md'`
`link.displayText          `: `'link_in_yaml'`

`link.originalMarkdown     `: `'[[#A link in a link_in_heading]]'`
`link.markdown             `: `'[[Test Data/links_everywhere.md#A link in a link_in_heading|A link in a link_in_heading]]'`
`link.destination          `: `'#A link in a link_in_heading'`
`link.destinationPath      `: `'Test Data/links_everywhere.md'`
`link.displayText          `: `'A link in a link_in_heading'`

`link.originalMarkdown     `: `'[[link_in_file_body]]'`
`link.markdown             `: `'[[link_in_file_body]]'`
`link.destination          `: `'link_in_file_body'`
`link.destinationPath      `: `'Test Data/link_in_file_body.md'`
`link.displayText          `: `'link_in_file_body'`

`link.originalMarkdown     `: `'[[link_in_heading]]'`
`link.markdown             `: `'[[link_in_heading]]'`
`link.destination          `: `'link_in_heading'`
`link.destinationPath      `: `'Test Data/link_in_heading.md'`
`link.displayText          `: `'link_in_heading'`

`link.originalMarkdown     `: `'[[link_in_task_wikilink]]'`
`link.markdown             `: `'[[link_in_task_wikilink]]'`
`link.destination          `: `'link_in_task_wikilink'`
`link.destinationPath      `: `'Test Data/link_in_task_wikilink.md'`
`link.displayText          `: `'link_in_task_wikilink'`

## Test Data/numbered_tasks_issue_3481.md

`link.originalMarkdown     `: `'[[numbered_tasks_issue_3481_searches]]'`
`link.markdown             `: `'[[numbered_tasks_issue_3481_searches]]'`
`link.destination          `: `'numbered_tasks_issue_3481_searches'`
`link.destinationPath      `: `'Test Data/numbered_tasks_issue_3481_searches.md'`
`link.displayText          `: `'numbered_tasks_issue_3481_searches'`

## Test Data/query_using_properties.md

`link.originalMarkdown     `: `'[[link_in_yaml]]'`
`link.markdown             `: `'[[link_in_yaml]]'`
`link.destination          `: `'link_in_yaml'`
`link.destinationPath      `: `'Test Data/link_in_yaml.md'`
`link.displayText          `: `'link_in_yaml'`

`link.originalMarkdown     `: `'[[link_in_file_body_with_custom_display_text]]'`
`link.markdown             `: `'[[link_in_file_body_with_custom_display_text]]'`
`link.destination          `: `'link_in_file_body_with_custom_display_text'`
`link.destinationPath      `: `'Test Data/link_in_file_body_with_custom_display_text.md'`
`link.displayText          `: `'link_in_file_body_with_custom_display_text'`

## Test Data/yaml_all_property_types_populated.md

`link.originalMarkdown     `: `'[[yaml_all_property_types_populated]]'`
`link.markdown             `: `'[[yaml_all_property_types_populated]]'`
`link.destination          `: `'yaml_all_property_types_populated'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_populated.md'`
`link.displayText          `: `'yaml_all_property_types_populated'`

`link.originalMarkdown     `: `'[[yaml_all_property_types_populated]]'`
`link.markdown             `: `'[[yaml_all_property_types_populated]]'`
`link.destination          `: `'yaml_all_property_types_populated'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_populated.md'`
`link.displayText          `: `'yaml_all_property_types_populated'`

`link.originalMarkdown     `: `'[[yaml_all_property_types_empty]]'`
`link.markdown             `: `'[[yaml_all_property_types_empty]]'`
`link.destination          `: `'yaml_all_property_types_empty'`
`link.destinationPath      `: `'Test Data/yaml_all_property_types_empty.md'`
`link.displayText          `: `'yaml_all_property_types_empty'`

