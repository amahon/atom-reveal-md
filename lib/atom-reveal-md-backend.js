'use babel';

import { spawn } from 'child_process';

import { getPathForEditor, getDirectoryForEditor, editorForId, getPreviewURL } from './atom-reveal-md-utils';

let mapping = {

};

export default class AtomRevealMDBackend{

  constructor(editor) {

    if(!editor) {
      return;
    }

    var filePath, fileDir, port, reveal_md_path, args;

    filePath = getPathForEditor(editor);
    fileDir = getDirectoryForEditor(editor);

    if(!mapping[fileDir]){
      mapping[fileDir] = this;

      port = Math.floor(Math.random() * (7000 - 6000) + 6000);

      reveal_md_path = path.join(__dirname, '..', 'node_modules', '.bin', 'reveal-md');
      args = [
        getPathForEditor(this.editor), '-D', '-w', '--port', port.toString()
      ];
      child = spawn(reveal_md_path, args, {
        cwd: fileDir,
        detached: true
      });

      child.on('error', function(e){console.log(e);});

      child.stdout.on('data', function (data) {
        // console.log('reveal-md.stdout: ' + data.toString());
      });

      child.stderr.on('data', function (data) {
        console.log('reveal-md.stdout: ' + data.toString());
      });

      mapping[fileDir] = {
        "child": child,
        "port": port
      };
    }

    return mapping[fileDir];
  }

  static cleanup() {
    for(var path in mapping){
      mapping[path].child.kill();
      mapping[path] = null;
    }
  }
}
