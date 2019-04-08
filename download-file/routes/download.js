const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(_, res) {
  const filename = `File-${Date.now()}`;
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `filename="${filename}`);
  const sampleCsv = fs.createReadStream(path.join(__dirname, 'sample-file'));
  sampleCsv.pipe(res);
});

module.exports = router;
