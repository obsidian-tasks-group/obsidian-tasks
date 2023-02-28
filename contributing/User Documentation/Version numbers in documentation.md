# Version numbers in documentation

> [!Note]
> The formatting below is specific to the original user documentation setup, published using #jekyll on #github-pages.

We have introduced version markers to the documentation, to show users in which Tasks version a specific feature was introduced.
This means that newly written documentation should be tagged with a placeholder, which will be replaced with the actual
version upon release.

There are 2 styles of placeholders used through the documentation, Please pick the one that
fits your text better. (If in doubt, take a look at the existing version tags for other features.)

This placeholder is usually used after a section heading:

```text
{: .released }
Introduced in Tasks X.Y.Z.
```

This placeholder is used when you need to tag a sub-part of something, for example a list:

```text
{: .released }
X (Y and Z) was introduced in Tasks X.Y.Z.
```
