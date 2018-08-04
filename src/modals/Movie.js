const mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
  title: String,
  name: String,
  nameCh: String,
  poster: String,
  year: String,
  country: String,
  categorys: Array,
  language: Array,
  subtitle: String,
  releaseTime: Array,
  imdbScore: Number,
  imdbGradeUserNum: String,
  doubanScore: Number,
  doubanGradedUserNum: String,
  fileFormat: String,
  videoTransCode: String,
  audioTransCode: String,
  videoSizeW: String,
  videoSizeH: String,
  fileSize: String,
  lengthOfFilm: String,
  directors: Array,
  actors: Array,
  intro: String,
  megnet: Array,
});

module.exports = mongoose.model('Movie', MovieSchema);