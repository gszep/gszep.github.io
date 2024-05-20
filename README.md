# Portfolio Website

### Install Dependencies

Setup a local environment for Ruby

```bash
sudo apt install rbenv
git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build
git -C "$(rbenv root)"/plugins/ruby-build pull
```

Install the version of Ruby [supported by Github pages](https://pages.github.com/versions/)

```bash
rbenv install 3.0.2
rbenv local 3.0.2
```

and finally the Jekyll dependencies

```bash
gem install bundler
bundle install
```

### Run local server

```bash
bundle exec jekyll serve
```
