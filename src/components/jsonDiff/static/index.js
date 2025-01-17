// http://json-diff.com/

// import CodeMirror from 'codemirror';
// import BackboneEvents from 'backbone-events-standalone';
import CodeMirror from  './vendor/codemirror/codemirror.js';
import BackboneEvents from './vendor/json-diff/backbone-events.min.js';

import  './vendor/codemirror/javascript.js';
import  './vendor/codemirror/active-line.js';
import  './vendor/codemirror/matchbrackets.js';
import  './vendor/codemirror/formatting.js';
import './vendor/codemirror/placeholder.js';
import jsonpatch from './vendor/json-diff/json-patch-duplex.min.js';
import { parse } from './vendor/json-diff/json-source-map.js'


export const JsonDiff = (function () {
  function JsonInputView(el, initialText) {
    //   console.log('JsonDiff--el--', el, initialText)
      this.el = el;
      let codemirror = this.codemirror = CodeMirror.fromTextArea(this.el, {
          lineNumbers: true,
          mode: {
              name: "javascript",
              json: true
          },
          matchBrackets: true,
          theme: 'tomorrow-night'
      });
      if (initialText) {
          codemirror.setValue(initialText);
      }
      let self = this;

      codemirror.on('inputRead', function (cm, e) {
          if (e.origin === 'paste') {
              autoFormat();
          }
          triggerChange();
      });
      codemirror.on('keyup', triggerChange);
      codemirror.on('change', triggerChange);
      codemirror.on('clear', function () {
          console.log(arguments);
      });

      let oldValue = '';

      function triggerChange() {
          let text = codemirror.getValue();
          if (text !== oldValue) {
              self.trigger('change');
          }
          oldValue = text;
      }

      function autoFormat() {
        console.log('JsonDiff--autoFormat begin')
          let totalLines = codemirror.lineCount();
          codemirror.autoFormatRange({
              line: 0,
              ch: 0
          }, {
              line: totalLines
          });
          codemirror.setSelection({
              line: 0,
              ch: 0
          });
          console.log('JsonDiff--autoFormat end')
      }
  }

  JsonInputView.prototype.getText = function () {
      return this.codemirror.getValue();
  };

  JsonInputView.prototype.setText = function (text) {
      return this.codemirror.setValue(text);
  };

  JsonInputView.prototype.highlightRemoval = function (diff) {
      this._highlight(diff, '#DD4444');
  };

  JsonInputView.prototype.highlightAddition = function (diff) {
      this._highlight(diff, '#4ba2ff');
  };

  JsonInputView.prototype.highlightChange = function (diff) {
      this._highlight(diff, '#E5E833');
  };

  JsonInputView.prototype._highlight = function (diff, color) {
      let pos = getStartAndEndPosOfDiff(this.getText(), diff);
      this.codemirror.markText(pos.start, pos.end, {
          css: 'background-color: ' + color
      });
  };

  JsonInputView.prototype.clearMarkers = function () {
      this.codemirror.getAllMarks().forEach(function (marker) {
          marker.clear();
      });
  };

  function getStartAndEndPosOfDiff(textValue, diff) {
      let result = parse(textValue);
      let pointers = result.pointers;
      let path = diff.path;
      let start = {
          line: pointers[path].key ? pointers[path].key.line : pointers[path].value.line,
          ch: pointers[path].key ? pointers[path].key.column : pointers[path].value.column
      };
      let end = {
          line: pointers[path].valueEnd.line,
          ch: pointers[path].valueEnd.column
      };

      return {
          start: start,
          end: end
      }
  }


  function onInputChange(text) {
    let inputText = this.getText()
    compareJson(inputText);
    resultFunc(inputText)
  }

  let leftInputView = null;
  let rightInputView = null;
  let errHandler = null;
  let diffHandler = null;

  function compareJson(inputText) {
      leftInputView.clearMarkers();
      rightInputView.clearMarkers();
      let leftText = leftInputView.getText(),
          rightText = rightInputView.getText();
      let leftJson, rightJson;
      try {
          if (leftText) {
              leftJson = JSON.parse(leftText);
          }
          errHandler && errHandler('left', true);
      } catch (e) {
          console.log('left ==>', e);
      }
      try {
          if (rightText) {
              rightJson = JSON.parse(rightText);
          }
          errHandler && errHandler('right', true);
      } catch (e) {
          console.log('right ==>', e);
      }
      if (!leftJson || !rightJson) {
          if (!leftJson && !rightJson) {
              errHandler && errHandler('left-right', false);
          } else if (!leftJson) {
              errHandler && errHandler('left', false);
          } else {
              errHandler && errHandler('right', false);
          }
          return;
      }
      let diffs = jsonpatch.compare(leftJson, rightJson);
      diffHandler && diffHandler(diffs, inputText);
      diffs.forEach(function (diff) {
          try {
              if (diff.op === 'remove') {
                  leftInputView.highlightRemoval(diff);
              } else if (diff.op === 'add') {
                  rightInputView.highlightAddition(diff);
              } else if (diff.op === 'replace') {
                  rightInputView.highlightChange(diff);
                  leftInputView.highlightChange(diff);
              }
          } catch (e) {
              console.warn('error while trying to highlight diff', e);
          }
      });
  }


  function init(left, right, errorHandler, dfHandler) {
    //   console.log('JsonDiff--left, right---', left, right)

      errHandler = errorHandler;
      diffHandler = dfHandler;

      BackboneEvents.mixin(JsonInputView.prototype);

      leftInputView = new JsonInputView(left, '');
      rightInputView = new JsonInputView(right, '');
      leftInputView.on('change', onInputChange);
      rightInputView.on('change', onInputChange);
      leftInputView.codemirror.on('scroll', function () {
          let scrollInfo = leftInputView.codemirror.getScrollInfo();
          rightInputView.codemirror.scrollTo(scrollInfo.left, scrollInfo.top);
      });
      rightInputView.codemirror.on('scroll', function () {
          let scrollInfo = rightInputView.codemirror.getScrollInfo();
          leftInputView.codemirror.scrollTo(scrollInfo.left, scrollInfo.top);
      });
  }

  function resultFunc(result) {
    return result
  }

  return {
      init: init,
      compareJson: compareJson,
      resultFunc: resultFunc
  }
})();