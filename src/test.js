const _ = require("loadash");

class LinerRegression {
  constructor(features, labels, options) {
    this.features = features;
    this.label = labels;

    this.options = Object.assign(
      { learningRate: 0.1, iterations: 1000 },
      options
    );

    this.m = 0;
    this.b = 0;
  }

  gradientDescent() {
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
  }

  train() {
    for (let i = 0; i < this.options.iterations; i++) {
      this.gradientDescent();
    }
  }
}


const LinerRegression = require('./LinerRegression')
const loadCSV = require('./load-csv')

let{features,labels,testFeatures,testLabels} = loadCSV('./cars.csv',{
    shuffle:true,
    splitTest:50,
    dataColumns:['horsePower'],
    labelColumns:['mpg']
});

const regression = new LinerRegression(features,labels,{
    learningRate:0.001,
    iteration:1
})

regression.train();

console.log('Updated M is : ' , regression.m, 'Updated B is : ',regression.b )



module.exports = LinerRegression