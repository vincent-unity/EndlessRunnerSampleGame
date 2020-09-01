mergeInto(LibraryManager.library, {
  JS_Cursor_SetShow: function (show) {
    Module.canvas.style.cursor = show ? "default" : "none";
  },
  JS_Cursor_SetImage: function (ptr, length) {
    var binary = "";
    for (var i = 0; i < length; i++)
      binary += String.fromCharCode(HEAPU8[ptr + i]);
    Module.canvas.style.cursor = "url(data:image/cur;base64," + btoa(binary) + "),default";
  }
});
