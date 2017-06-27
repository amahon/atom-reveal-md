'use babel';

import path from 'path';

function getPathForEditor(editor) {
  if(editor) {
    return editor.getPath();
  }
}

function getDirectoryForEditor(editor) {
  if(getPathForEditor(editor)) {
    return path.dirname(getPathForEditor(editor));
  }
}

function editorForId(id) {
  var editors = atom.workspace.getTextEditors();
  for(var editor in editors) {
    if(editors[editor].id) {
      if(editors[editor].id.toString() == id.toString()) {
        return editors[editor];
      }
    }
  }
}

function getPreviewURL(editor, port) {
  var relativePath = path.relative(getDirectoryForEditor(editor), getPathForEditor(editor));
  return 'http://localhost:' + port.toString() + '/' + relativePath;
}


export { getPathForEditor, getDirectoryForEditor, editorForId, getPreviewURL }
