FROM ruby:2.7
EXPOSE 4000

COPY . /docs
WORKDIR /docs

RUN bundle install

CMD bundle exec jekyll serve --watch -H 0.0.0.0 -P 4000
