FROM ruby:2.7
WORKDIR /code
EXPOSE 4000
COPY . .

WORKDIR /code/docs
RUN bundle install
CMD bundle exec jekyll serve -H 0.0.0.0
