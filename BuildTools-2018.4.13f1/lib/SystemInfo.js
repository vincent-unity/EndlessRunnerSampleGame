var LibrarySystemInfoWebGL = {
	JS_SystemInfo_HasWebGL: function() 
	{
		return UnityLoader.SystemInfo.hasWebGL;
	},

	JS_SystemInfo_HasCursorLock: function() 
	{
		return UnityLoader.SystemInfo.hasCursorLock;
	},

	JS_SystemInfo_HasFullscreen: function() 
	{
		return UnityLoader.SystemInfo.hasFullscreen;
	},

	JS_SystemInfo_IsMobile: function() 
	{
		return UnityLoader.SystemInfo.mobile;
	},

	JS_SystemInfo_GetWidth: function() 
	{
		return UnityLoader.SystemInfo.width;
	},

	JS_SystemInfo_GetHeight: function() 
	{
		return UnityLoader.SystemInfo.height;
	},

	JS_SystemInfo_GetCurrentCanvasWidth: function() 
	{
		if (!Module.IsWxGame)
		{
			return Module['canvas'].clientWidth;	
		}
		else
		{
			return Module['canvas'].width;	
		}
	},

	JS_SystemInfo_GetCurrentCanvasHeight: function() 
	{
		if (!Module.IsWxGame)
		{
			return Module['canvas'].clientHeight;	
		}
		else
		{
			return Module['canvas'].height;	
		}
	},

	JS_SystemInfo_GetDocumentURL: function(buffer, bufferSize) 
	{
		if (!Module.IsWxGame)
		{
			if (buffer)
			stringToUTF8(document.URL, buffer, bufferSize);
		    return lengthBytesUTF8(document.URL);
		}
		else
		{
			return 0;
		}
	},

	JS_SystemInfo_GetStreamingAssetsURL: function(buffer, bufferSize) 
	{
		var streamingAssetsUrl = Module.streamingAssetsUrl();
		if (buffer) stringToUTF8(streamingAssetsUrl, buffer, bufferSize);
		return lengthBytesUTF8(streamingAssetsUrl);
	},

	JS_SystemInfo_GetBrowserName: function(buffer, bufferSize) 
	{
		var browser = UnityLoader.SystemInfo.browser;
		if (buffer)
			stringToUTF8(browser, buffer, bufferSize);
		return lengthBytesUTF8(browser);
	},

	JS_SystemInfo_GetBrowserVersionString: function(buffer, bufferSize)
	{
		var browserVer = UnityLoader.SystemInfo.browserVersion;
		if (buffer)
			stringToUTF8(browserVer, buffer, bufferSize);
		return lengthBytesUTF8(browserVer);
	},

	JS_SystemInfo_GetBrowserVersion: function() 
	{
		return UnityLoader.SystemInfo.browserVersion;
	},

	JS_SystemInfo_GetOS: function(buffer, bufferSize) 
	{
		var browser = UnityLoader.SystemInfo.os + " " + UnityLoader.SystemInfo.osVersion;
		if (buffer)
			stringToUTF8(browser, buffer, bufferSize);
		return lengthBytesUTF8(browser);
	},

	JS_SystemInfo_GetLanguage: function(buffer, bufferSize) 
	{
		var language = UnityLoader.SystemInfo.language;
		if (buffer)
			stringToUTF8(language, buffer, bufferSize);
		return lengthBytesUTF8(language);
	},

	JS_SystemInfo_GetMemory: function() 
	{
		return TOTAL_MEMORY/(1024*1024);
	},

	JS_SystemInfo_GetGPUInfo : function(buffer, bufferSize)
	{
		var gpuinfo = UnityLoader.SystemInfo.gpu;
		if (buffer)
			stringToUTF8(gpuinfo, buffer, bufferSize);
		return lengthBytesUTF8(gpuinfo);
	}
};

mergeInto(LibraryManager.library, LibrarySystemInfoWebGL);
