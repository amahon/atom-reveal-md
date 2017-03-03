'use babel';

import { CompositeDisposable } from 'atom';
import { $, $$$, ScrollView } from 'atom-space-pen-views';
import { allowUnsafeEval, allowUnsafeNewFunction } from 'loophole';
import path from 'path';
import { spawn } from 'child_process';

export default class AtomRevealMdView extends ScrollView {

  constructor(editorID) {
    super();

    this.editorID = editorID;
    this.editor = null;
    this.webview = null;
    this.child = null;
    this.port = Math.floor(Math.random() * (7000 - 6000) + 6000);

    if(editorID) {
      this.resolveEditor(editorID);

      var reveal_md_path = path.join(__dirname, '..', 'node_modules', '.bin', 'reveal-md');
      var args = [
        this.getPath(), '-D', '-w', '--port', this.port.toString()
      ];
      child = spawn(reveal_md_path, args, {
        cwd: this.getDirectory(),
        detached: true
      });
      console.log(child);
      child.on('error', function(e){console.log(e);});

      child.stdout.on('data', function (data) {
        console.log('reveal-md.stdout: ' + data.toString());
      });

      child.stderr.on('data', function (data) {
        console.log('reveal-md.stdout: ' + data.toString());
      });

      this.child = child;
    }

  }

  static content() {
    return this.div({class: 'atom-reveal-md native-key-bindings', tabindex: -1}, () => {
      let style = 'z-index: 2; padding: 2em;';
    });
  }

  resolveEditor(id) {
    let resolve = () => {
      this.editor = this.editorForId(id);
      if(this.editor) {
        this.trigger('title-changed');
        this.handleEvents();
      } else {
        if(atom.workspace) {
          if(atom.workspace.paneForItem(this)){
            atom.workspace.paneForItem(this).destroyItem(this);
          }
        }
      }
    };

    if(atom.workspace) {
      resolve();
    } else {
      atom.packages.onDidActivatePackage(onActivate = () => {
        resolve();
      })
    }
  }

  editorForId(id) {
    var editors = atom.workspace.getTextEditors();
    for(var editor in editors) {
      if(editors[editor].id) {
        if(editors[editor].id.toString() == id.toString()) {
          return editors[editor];
        }
      }
    }
  }

  serialize() {

  }

  handleEvents() {
    this.editorSub = new CompositeDisposable();

    if(this.editor) {
      this.editorSub.add(this.editor.onDidChangePath(() => this.trigger('title-changed')));
    }

  }

  showRevealPreview() {
    this.setupWebview();
    this.hideLoading();
    this.hideError();
  }

  setupWebview() {
    var webview, previewURL;
    if(!this.webview) {
      webview = document.createElement("webview");
      webview.setAttribute("style", "height: 100%");
      this.append($(webview));
      setTimeout(() => {
          previewURL = this.getPreviewURL();
          webview.setAttribute("src", previewURL);
      }, 1000);
      this.webview = webview;
    }
  }

  showLoading() {
    this.find('.show-loading').show();
  }

  hideLoading() {
    this.find('.show-loading').hide();
  }

  hideError() {
    this.find('.show-error').hide();
  }

  getURI() {
    return "atom-reveal-md://editor/" + this.editorID;
  }

  getTitle() {
    if(this.editor) {
      return this.editor.getTitle() + " Preview";
    } else {
      return "Reveal MD Preview";
    }
  }

  getPath() {
    if(this.editor) {
      return this.editor.getPath();
    }
  }

  getDirectory() {
    if(this.getPath()) {
      return path.dirname(this.getPath());
    }
  }

  getPreviewURL() {
    var relativePath = path.relative(this.getDirectory(), this.getPath());
    return 'http://localhost:' + this.port.toString() + '/' + relativePath;
  }

  destroy() {
    if(this.webview) {
        this.webview.remove();
    }
    if(this.child) {
        this.child.kill();
    }
  }

  getElement() {
    return this.element;
  }

}
