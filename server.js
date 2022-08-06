const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const ngrok = require("ngrok");

const PORT = 3000;

// create application/json parser
var jsonParser = bodyParser.json();

app.use(jsonParser);

app.all("*", function (req, res) {
  console.log({ url: req.url, body: req.body });

  res.json({ msg: "hello world" }).end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

(async function () {
  const url = await ngrok.connect(PORT);
  console.log(url);
})();
