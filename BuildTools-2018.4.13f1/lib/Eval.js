var LibraryEvalWebGL = {

JS_Eval_EvalJS: function(ptr)
{
	var str = Pointer_stringify(ptr);
	try {
		eval (str);
	}
	catch (exception)
	{
		console.error(exception);
	}
},

JS_Eval_OpenURL: function(ptr)
{
	var str = Pointer_stringify(ptr);
	location.href = str;
},

JS_Eval_SetTimeout: function(func, arg, millis)
{
    Module['noExitRuntime'] = true;

    function wrapper() {
      getFuncWrapper(func, 'vi')(arg);
    }

	return Browser.safeSetTimeout(wrapper, millis);
},

JS_Eval_ClearTimeout: function(id)
{
	window.clearTimeout(id);
}


};

mergeInto(LibraryManager.library, LibraryEvalWebGL);
