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
            .join(" & ")}) | python ${filename}`
        : `python ${filename}`,
      (error, stdout, stderr) => {
        exec(`rm ${filename}`);
        resolve(
          stdout.toString() ||
            (error && error.message.split("<module>")[1].trim()) ||
            stderr.toString()
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
        ? `(${input
            .split(/(\n| )/)
            .map((i) => i.trim() && `echo ${i}`)
            .filter((i) => !!i)
            .join(
              " & "
            )}) | gcc ${filename} -o ${outputFilename} && ${outputFilename}`
        : `gcc ${filename}`,
      (error, stdout, stderr) => {
        exec(`rm ${filename} ${outputFilename}`);
        resolve(
          stdout.toString() || (error && error.message) || stderr.toString()
        );
      }
    );
  });

exports.postSubmission = async (req, res, next) => {
  const { code, input = "0" } = req.body || {};

  res.send({ output: await runCpp(code, input) });
};
