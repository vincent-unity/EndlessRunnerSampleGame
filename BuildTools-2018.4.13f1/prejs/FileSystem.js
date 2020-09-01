Module['preRun'].push(function (){
	// Initialize the IndexedDB based file system. Module['unityFileSystemInit'] allows
	// developers to override this with their own function, when they want to do cloud storage 
	// instead.
	var unityFileSystemInit = Module['unityFileSystemInit'] || function (){
		if (!Module.indexedDB)
		{
			console.log('IndexedDB is not available. Data will not persist in cache and PlayerPrefs will not be saved.');
		}
		FS.mkdir('/idbfs');
		FS.mount(IDBFS, {}, '/idbfs');
		Module.addRunDependency('JS_FileSystem_Mount');
		FS.syncfs(true, function (err) {
			Module.removeRunDependency('JS_FileSystem_Mount'); 
		});
	};	
	unityFileSystemInit();
});