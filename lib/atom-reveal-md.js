'use babel';

import AtomRevealMdView from './atom-reveal-md-view';
import url from 'url';
import path from 'path';
import { CompositeDisposable } from 'atom';
import { spawn } from 'child_process';
import opn from 'opn';

export default {

  revealPreviewView: null,
  subscriptions: null,

  activate(state) {
    console.log('atom-reveal-md')

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-reveal-md:toggle': this.toggle,
      'atom-reveal-md:add-slide': this.addSlide,
      'atom-reveal-md:add-subslide': this.addSubSlide,
      'atom-reveal-md:static': this.renderToStatic,
      'atom-reveal-md:open-browser': this.openBrowser,
    }));

    atom.workspace.addOpener(function(uriToOpen) {
      parsedUrl = url.parse(uriToOpen);
      if(parsedUrl.protocol != 'atom-reveal-md:') {
        return;
      }
      revealPreviewView = new AtomRevealMdView(parsedUrl.pathname.substring(1))
      return revealPreviewView;
    });

  },

  deactivate() {
    this.subscriptions.dispose();
    if(this.revealPreviewView) {
      this.revealPreviewView.destroy();
    }
  },

  toggle() {
    var editor = atom.workspace.getActiveTextEditor();
    if(!editor) {
      return;
    }

    uri = 'atom-reveal-md://editor/' + editor.id;

    var previewPane = atom.workspace.paneForURI(uri);
    if(previewPane) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
      return;
    }

    var previousActivePane = atom.workspace.getActivePane();

    let paneOpenedCallback = (revealPreviewView) => {
      if(revealPreviewView instanceof AtomRevealMdView) {
        revealPreviewView.showRevealPreview();
        this.revealPreviewView = revealPreviewView;
        previousActivePane.activate();
      }
    }
    atom.workspace.open(uri, {split: 'right', searchAllPanes: true}).done(paneOpenedCallback);
  },

  addSlide() {
    var editor = atom.workspace.getActiveTextEditor();
    if(editor && editor.buffer) {
      editor.insertText('\n<!-- slide -->\n');
    }
  },

  addSubSlide() {
    var editor = atom.workspace.getActiveTextEditor();
    if(editor && editor.buffer) {
      editor.insertText('\n<!-- subslide -->\n');
    }
  },

  renderToStatic() {
    var editor = atom.workspace.getActiveTextEditor();
    if(!editor) {
      return;
    }

    var filePath = editor.getPath();
    var baseName = path.basename(filePath, '.md');
    var directory = path.dirname(filePath);
    var relativePath = path.relative(directory, filePath);

    var reveal_md_path = path.join(__dirname, '..', 'node_modules', '.bin', 'reveal-md');
    var args = [
      relativePath,
      '--static', './_static/' + baseName,
      '--static-dirs', 'assets,theme'
    ];
    console.log(args);
    console.log(args);
    child = spawn(reveal_md_path, args, {
      cwd: directory
    });
    child.on('error', function(e){console.log(e);});
    child.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
    });

    child.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    });

    child.on('exit', function (code) {
      console.log('child process exited with code ' + code.toString());
    });
    
  },

  openBrowser() {
    if(this.revealPreviewView) {
      opn(this.revealPreviewView.getPreviewURL()).catch(function(error) {
        atom.notifications.addError(error.toString(), {detail: error.stack || '', dismissable: true});
       console.error(error);
      });
    }
  }

};
