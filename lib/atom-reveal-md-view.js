'use babel';

import { CompositeDisposable } from 'atom';
import { $, $$$, ScrollView } from 'atom-space-pen-views';
import { allowUnsafeEval, allowUnsafeNewFunction } from 'loophole';
import path from 'path';

import { getPathForEditor, getDirectoryForEditor, editorForId, getPreviewURL } from './atom-reveal-md-utils';

export default class AtomRevealMdView extends ScrollView {

  constructor(editorID, port) {
    super();

    this.editorID = editorID;
    this.editor = null;
    this.webview = null;
    this.port = port;

    console.log(this.port, this.port);

    this.resolveEditor(editorID);
  }

  static content() {
    return this.div({class: 'atom-reveal-md native-key-bindings', tabindex: -1}, () => {
      let style = 'z-index: 2; padding: 2em;';
    });
  }

  // duplicated
  resolveEditor(id) {
    let resolve = () => {
      this.editor = editorForId(id);
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
          previewURL = getPreviewURL(this.editor, this.port);
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

  destroy() {
    if(this.webview) {
        this.webview.remove();
    }
  }

  getElement() {
    return this.element;
  }

}
