var LibraryWebRequestWebGL = {
	$wr: {
		requestInstances: {},
		nextRequestId: 1
	},

	JS_WebRequest_Create: function(url, method)
	{
		var http = new XMLHttpRequest();
		var _url = Pointer_stringify(url);
		var _method = Pointer_stringify(method);
		http.open(_method, _url, true);
		http.responseType = 'arraybuffer';
		wr.requestInstances[wr.nextRequestId] = http;
		return wr.nextRequestId++;
	},

	JS_WebRequest_SetTimeout: function (request, timeout)
	{
		wr.requestInstances[request].timeout = timeout;
	},

	JS_WebRequest_SetRequestHeader: function (request, header, value)
	{
		var _header = Pointer_stringify(header);
		var _value = Pointer_stringify(value);
		wr.requestInstances[request].setRequestHeader(_header, _value);
	},

	JS_WebRequest_SetResponseHandler: function (request, arg, onresponse)
	{
		var http = wr.requestInstances[request];
		// LOAD
		http.onload = function http_onload(e) {
			if (onresponse)
			{
				var kWebRequestOK = 0;
				var byteArray = new Uint8Array(http.response);
				// 200 is successful http request, 0 is returned by non-http requests (file:).
				if (byteArray.length != 0)
				{
					var buffer = _malloc(byteArray.length);
					HEAPU8.set(byteArray, buffer);
					dynCall('viiiiii', onresponse, [arg, http.status, buffer, byteArray.length, 0, kWebRequestOK]);
				}
				else
				{
					dynCall('viiiiii', onresponse, [arg, http.status, 0, 0, 0, kWebRequestOK]);
				}
			}
		};

		function HandleError(err, code)
		{
			if (onresponse)
			{
				var len = lengthBytesUTF8(err) + 1;
				var buffer = _malloc(len);
				stringToUTF8(err, buffer, len);
				dynCall('viiiiii', onresponse, [arg, http.status, 0, 0, buffer, code]);
				_free(buffer);
			}
		}

		// ERROR
		http.onerror = function http_onerror(e) {
			var kWebErrorUnknown = 2;
			HandleError ("Unknown error.", kWebErrorUnknown);
		};

		http.ontimeout = function http_onerror(e) {
			var kWebErrorTimeout = 14;
			HandleError ("Connection timed out.", kWebErrorTimeout);
		};

		http.onabort = function http_onerror(e) {
			var kWebErrorAborted = 17;
			HandleError ("Aborted.", kWebErrorAborted);
		};
	},

	JS_WebRequest_SetProgressHandler: function (request, arg, onprogress)
	{
		var http = wr.requestInstances[request];

		http.onprogress = function http_onprogress(e) {
			if (onprogress)
			{
				if (e.lengthComputable)
					dynCall('viii', onprogress, [arg, e.loaded, e.total]);
			}
		};
	},

	JS_WebRequest_Send: function (request, ptr, length)
	{
		var http = wr.requestInstances[request];

		try {
			if (length > 0)
				http.send(HEAPU8.subarray(ptr, ptr+length));
			else
				http.send();
		}
		catch(e) {
			console.error(e.name + ": " + e.message);
		}
	},

	JS_WebRequest_GetResponseHeaders: function(request, buffer, bufferSize)
	{
		var headers = wr.requestInstances[request].getAllResponseHeaders();
		if (buffer)
			stringToUTF8(headers, buffer, bufferSize);
		return lengthBytesUTF8(headers);
	},

	JS_WebRequest_GetStatusLine: function(request, buffer, bufferSize)
	{
		var status = wr.requestInstances[request].status + " " + wr.requestInstances[request].statusText;
		if (buffer)
			stringToUTF8(status, buffer, bufferSize);
		return lengthBytesUTF8(status);
	},

	JS_WebRequest_Abort: function (request)
	{
		wr.requestInstances[request].abort();
	},

	JS_WebRequest_Release: function (request)
	{
		var http = wr.requestInstances[request];

		http.onload = null;
		http.onerror = null;
		http.ontimeout = null;
		http.onabort = null;
		delete http;

		wr.requestInstances[request] = null;
	}
};

autoAddDeps(LibraryWebRequestWebGL, '$wr');
mergeInto(LibraryManager.library, LibraryWebRequestWebGL);
