FROM ruby:3.0
WORKDIR /code
EXPOSE 4000
COPY . .
RUN bundle install
CMD bundle exec jekyll serve -H 0.0.0.0
