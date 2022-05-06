FROM ruby:2.7
WORKDIR /code
EXPOSE 4000
COPY . .

WORKDIR /code/docs
RUN bundle install
CMD bundle exec jekyll serve -H 0.0.0.0

# TODO Add a note in CONTRIBUTING.md linking to docs/README.md
# TODO Move the following to docs/README.md
# Make sure Docker is running
#  cd obsidian-tasks/
#  docker-compose up
#   (not docker compose up)
# Then open http://0.0.0.0:4000/obsidian-tasks/ in your local browser
# Note that you can edit the files on your local machine and then refresh in the browser
