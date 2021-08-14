const _ = require("loadash");
const tf = require("@tensorflow/tfjs");

class LinerRegression {
  constructor(features, labels, options) {
    this.features = tf.tensor(features);
    this.label = tf.tensor(labels);

    this.features = tf
      .ones([this.features.shape[0], 1])
      .concat(this.features, 1);

    this.options = Object.assign(
      { learningRate: 0.1, iterations: 1000 },
      options
    );

    this.weights = tf.zeros([2, 1]);
  }

  /*  gradientDescent() {
    const currentGuesses = this.features.map((row) => {
      return this.m * row[0] + this.b;
    });

    const bSlope =
      (_.sum(
        currentGuesses.map((guess, i) => {
          return guess - this.labels[i][0];
        })
      ) *
        2) /
      this.features.length;

    const mSlope =
      (_.sum(
        currentGuesses.map((guess, i) => {
          return -1 * this.features[i][0] * (this.labels[i][0] - guess);
        })
      ) *
        2) /
      this.features.length;

    this.m = this.m - mSlope * this.options.learningRate;
    this.b = this.b - bSlope * this.options.learningRate;
  } */

  gradientDescent() {
    const currentGuess = this.features.matMul(this.weights);
    const differences = currentGuess.sub(this.labels);

    const slopes = this.features
      .transpose()
      .matMul(differences)
      .div(this.features.shape[0]);
    //.mul(2) this is optional because it will be multiplied by the learning rate and altered anyways

    this.weights = this.weights.sub(slopes.mul(this.options.learningRate));
  }
  train() {
    for (let i = 0; i < this.options.iterations; i++) {
      this.gradientDescent();
    }
  }
}

const LinerRegression = require("./LinerRegression");
const loadCSV = require("./load-csv");

let { features, labels, testFeatures, testLabels } = loadCSV("./cars.csv", {
  shuffle: true,
  splitTest: 50,
  dataColumns: ["horsePower"],
  labelColumns: ["mpg"],
});

const regression = new LinerRegression(features, labels, {
  learningRate: 0.001,
  iteration: 1,
});

regression.train();

console.log(
  "Updated M is : ",
  regression.weights.get(1, 0),
  "Updated B is : ",
  regression.weights.get(0, 0)
);

module.exports = LinerRegression;
