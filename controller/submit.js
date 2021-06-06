const { exec } = require("child_process");
const uuid = require("uuid").v4;
const fs = require("fs");

const runPython = (code, input) =>
  new Promise((resolve) => {
    const filename = uuid() + ".py";

    fs.writeFileSync(filename, code);
    exec(
      input
        ? `(${input
            .split(/(\n| )/)
            .map((i) => i.trim() && `echo ${i}`)
            .filter((i) => !!i)
            .join(" & ")}) | python3 ${filename}`
        : `python3 ${filename}`,
      { timeout: 5 * 1000 },
      (error, stdout) => {
        exec(`rm ${filename}`);
        resolve(
          stdout.toString() +
            ((error && error.message.split("<module>")[1].trim()) || " ")
        );
      }
    );
  });

const runCpp = (code, input) =>
  new Promise((resolve) => {
    const outputFilename = uuid();
    const filename = outputFilename + ".cpp";

    fs.writeFileSync(filename, code);
    exec(
      input
        ? `
        gcc ${filename} -o ${outputFilename} &&
        (${input
          .split(/(\n| )/)
          .map((i) => i.trim() && `echo ${i}`)
          .filter((i) => !!i)
          .join(" & ")}) | ./${outputFilename}`
        : `gcc ${filename} -lstdc++ -o ${outputFilename} && ./${outputFilename}`,
      { timeout: 5 * 1000 },
      (error, stdout, stderr) => {
        exec(`rm ${filename} ${outputFilename}`);
        resolve(stdout.toString() + ((error && error.message) || " "));
      }
    );
  });

const runJavaScript = (code, input) =>
  new Promise((resolve) => {
    const filename = uuid() + ".js";
    console.log(code);
    fs.writeFileSync(filename, code);
    exec(`node ${filename}`, { timeout: 5 * 1000 }, (error, stdout) => {
      console.log(stdout)
      exec(`rm ${filename}`);
      resolve(stdout.toString() + ((error && error.message) || " "));
    });
  });

const langCompilerMap = {
  python: runPython,
  c_cpp: runCpp,
  javascript: runJavaScript,
};

exports.postSubmission = async (req, res, next) => {
  const { code, mode, input = "0" } = req.body || {};

  const compiler = langCompilerMap[mode];

  if (!compiler)
    return res.status(402).send({ error: "The lang is not supported." });

  res.send({ output: await compiler(code, input) });
};
