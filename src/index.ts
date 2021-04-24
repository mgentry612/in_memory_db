const readline = require('readline');
import { Controller } from './database/controller.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const controller = new Controller();

rl.on('line', function(line: string){
    const message = controller.newLine(line);
    if (message === null) {
        rl.close()
    } else if (message) {
        console.log(message);
    }
});