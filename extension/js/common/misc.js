var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    var Misc = {
      async: function(generator, self) {
          return new Promise(function(resolve, reject) {
              var it, onFulfilled, onRejected, loop;

              onFulfilled = function(result) {
                  try {
                      var ret = it.next(result);
                      if (ret.done) {
                          resolve(ret.value);
                      } else {
                          loop(ret.value);
                      }
                  } catch (e) {
                      reject(e);
                  }
              };

              onRejected = function(reason) {
                  try {
                      var ret = it.throw(reason);
                      if (ret.done) {
                          resolve(ret.value);
                      } else {
                          loop(ret.value);
                      }
                  } catch (e) {
                      reject(e);
                  }
              };

              loop = function(value) {
                  value.then(onFulfilled, onRejected);
              };

              it = generator.call(self);
              onFulfilled(null);
          });
      },

      reviver: function(class_list) {
          return function(key, value) {
              if (!(value instanceof Object)) {
                  return value;
              }

              var ret = value;
              class_list.every((klass) => {
                  ret = klass.reviver(key, value);
                  return (ret === value);
              });

              return ret;
          };
      },

      sleep: function(msecond) {
          return new Promise(function(resolve, reject) {
              setTimeout(resolve, msecond);
          });
      },

      ////////////////////////////////////////////
      executeScript: function(file, run_at) {
          return new Promise(function(resolve, reject) {
              chrome.tabs.executeScript({ file: file, runAt: run_at }, resolve);
          });
      },

      executeScripts: function(files, run_at) {
          return Misc.async(function*() {
              for (var file of files) {
                  yield Misc.executeScript(file, run_at);
              }
          });
      },

      insertCSS: function(file, run_at) {
          return new Promise(function(resolve, reject) {
              chrome.tabs.insertCSS({ file: file, runAt: run_at }, resolve);
          });
      },

      insertCSSes: function(files, run_at) {
          return Misc.async(function*() {
              for (var file of files) {
                  yield Misc.insertCSS(file,run_at);
              }
          });
      }
    };

    ctx.Misc = Misc;
})(OpenTsvn);
