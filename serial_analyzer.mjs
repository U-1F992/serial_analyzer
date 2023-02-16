import { ReadlineParser, SerialPort } from "serialport";
import inquirer from "inquirer";
import chalk from "chalk";

const paths = await SerialPort.list().then(infos => infos.map(info => info.path));

const targetPath = await inquirer.prompt([{
    type: 'list',
    name: 'path',
    message: 'Select path to analyze',
    choices: paths,
}]).then(answers => answers.path);
paths.splice(paths.indexOf(targetPath), 1)

const passThroughPath = await inquirer.prompt([{
    type: 'list',
    name: 'path',
    message: 'Select path to pass-through',
    choices: paths,
}]).then(answers => answers.path);

const baudRate = await inquirer.prompt([{
    type: 'list',
    name: 'baudRate',
    message: 'Select baud rate',
    choices: [4800, 9600],
}]).then(answers => answers.baudRate);

console.log("========================================");

const target = new SerialPort({
    path: targetPath,
    baudRate: baudRate,
});

const passThrough = new SerialPort({
    path: passThroughPath,
    baudRate: baudRate,
});

const parser = target.pipe(new ReadlineParser());
parser.on("data", data => {
    passThrough.write(data);
    console.log(`[${new Date().toISOString()}] ${chalk.green(`>>>`)} ${data.toString()}`);
});

passThrough.on("data", data => {
    target.write(data);
    console.log(`[${new Date().toISOString()}] ${chalk.blue(`<<<`)} ${data.toString("hex").match(/.{2}/g).map(s => `0x${s}`)}`);
});
