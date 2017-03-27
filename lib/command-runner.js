'use strict';
const {spawn} = require('child_process');
const {join} = require('path');
const which = require('which');
const fs = require('fs');
const path = require('fs');

exports.run = function (command) {
  return new Promise((resolve, reject) => {
    which(command.cmd, (err, cmdpath) => {
      next = function (cb, cmdpath) {
        const cmd = spawn(quoteIfNecessary(cmdpath), command.args, {shell: true, stdio: 'inherit', cwd: command.cwd || process.cwd()});
        cmd.on('close', code => {
          if (code !== 0) {
            return reject(new Error(`"${command.cmd}" exited with non-zero code ${code}`));
          }
          resolve();
        });
      }
      if (err) {
        var possible_node_module_location = path.join('node_modules','.bin', command.cmd);
        fs.access(possible_node_module_location, fs.constants.X_OK, (err) => {
          if (err) {
            return reject(new Error(`Can't install! "${command.cmd}" doesn't seem to be installed.`));
          } else {
            next(cb, possible_node_module_location);
          }
        });
      } else {
        next(cb, cmdpath);
      }
    });
  });
};

function quoteIfNecessary(command) {
  return /\s+/.test(command) ? `"${command}"` : command;
}
