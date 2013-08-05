ember-performance
=================

The goal of this project is to create a comprehensive suite of tests to improve
the performance of Ember.js.

![Screenshot](http://i.imgur.com/E4R4iMy.png)

## Usage

1. Clone the repo
2. Open in a browser
3. Click the button for the test you want to run.


## Running against a new Ember.js Build

Simply replace the `ember-master.js` file with the latest *production* build of EmberJS
you want to test.

1. Clone ember-performance to your computer.
2. Clone the [Ember.js](https://github.com/emberjs/ember.js) project someone on your computer.
3. In the Ember.js directory, execute a command like so: `rake clean && rake dist && cp dist/ember.prod.js /Users/robin/code/ember-performance/js/libs/ember-master.js` (you will need to replace `/Users/robin/code/ember-performance` with the appropriate path on your computer.)
4. Reload in your browser and run the tests!


## License

MIT
