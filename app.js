const path = require("path");
const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const submitRoute = require("./routes/submit");

const app = express();

app.use(parser.json());
app.use(cors());
app.use("/submissions", submitRoute);

app.listen(8000, () => {
  console.log("Server connected to 8000");
});
