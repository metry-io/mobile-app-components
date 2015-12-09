module.exports = /*@ngInject*/ function() {
  return function(stats) {
    return (stats.count === 0) ? "-" : "" + (stats.sum / stats.count);
  };
};
