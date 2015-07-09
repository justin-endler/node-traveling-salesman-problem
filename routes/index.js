
/*
 * GET home page.
 */
// Instructions.
exports.index = function (req, res) {
  res.render('index', {
    title: 'Instructions'
  });
};
