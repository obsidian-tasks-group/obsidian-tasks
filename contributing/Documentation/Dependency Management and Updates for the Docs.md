# Dependency Management and Updates for the Docs

> [!Note]
> This page is about the original user documentation setup, published using #jekyll on #github-pages.

The dependencies for running the docs locally are stored in the `Gemfile` (short, equivalent to Javascript `package.json`) and `Gemfile.lock` (auto-generated, equivalent to `yarn.lock`) files.
The package manager (equivalent to "yarn") is "bundle" [docs here](https://bundler.io/guides/using_bundler_in_applications.html#recommended-workflow). The "docker_start" script runs the initial
`bundle install` when building the Docker image.
If seeing issues with dependencies or with running the docs locally, check that the versions in the `Gemfile`, especially "github-pages" are up-to-date. If making edits to the `Gemfile`, you
will need to run `bundle install` or `bundle update` manually. (You may also need to update `bundle` itself!) Before checking in any changes to `Gemfile.lock`, see the paragraph below.

Some dependencies, such as "nokogiri", have platform-specific gems that **should not** be checked into the repo's `Gemfile.lock`.
For example, Dependabot might add a Linux-specific version of a dependency to the `Gemfile.lock`, which must then be manually edited to remove the Linux-specific version.
Otherwise, future contributors on non-Linux systems will be unable to build the Docker image or run Jekyll locally.
