# Documentation for Obsidian Tasks

## Overview

- The documentation is written in Markdown
- It is converted to HTML via Ruby and Jekyll
  - Important: Ruby 2 is required, for example, Ruby 2.7
- The published documentation is at <https://schemar.github.io/obsidian-tasks/>

## Test documentation locally with Jekyll

When making significant edits to the documentation, it is helpful to see what
the published docs will look like. This allows spotting of problems like formatting oddities.

## Option 1: Testing via Docker

If you can run docker, this is the easiest way.

### Prerequisites for using Docker

1. Install Docker
2. Ensure Docker is running

### Seeing the docs via Docker

Now every time you want to see the docs locally, run:

```bash
cd obsidian-tasks/
docker-compose up
#  (not docker compose up)
```

You will eventually see output ending something like this:

```text
web_1  | Configuration file: /code/docs/_config.yml
web_1  |             Source: /code/docs
web_1  |        Destination: /code/docs/_site
web_1  |  Incremental build: disabled. Enable with --incremental
web_1  |       Generating...
web_1  |       Remote Theme: Using theme pmarsceill/just-the-docs
web_1  |        Jekyll Feed: Generating feed for posts
web_1  |                     done in 4.838 seconds.
web_1  | /usr/local/bundle/gems/pathutil-0.16.2/lib/pathutil.rb:502: warning: Using the last argument as keyword parameters is deprecated
web_1  |  Auto-regeneration: enabled for '/code/docs'
web_1  |     Server address: http://0.0.0.0:4000/obsidian-tasks/
web_1  |   Server running... press ctrl-c to stop.
```

This runs a web server inside Docker that you can view on your own machine.
Look for the line containing `Server address:` and open that URL in your local browser.
It will be something like <http://0.0.0.0:4000/obsidian-tasks/>.

Note that you can edit the files on your local machine and
then refresh in the browser a few seconds later.

### Option 2: Testing via local installed Ruby and Jekyll



`bundle exec jekyll serve`
