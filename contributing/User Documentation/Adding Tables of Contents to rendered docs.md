# Adding Tables of Contents to rendered docs

Add the following between the H1 and the first H2, to show a table of contents in a page on the published documentation.

```text
# Page Heading
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---
```
