var LibraryFileSystemWebGL = {

$fs: {
	numPendingSync : 0,
	syncIntervalID : 0,
	syncInProgress : false,
	sync : function(onlyPendingSync)
	{
		if (onlyPendingSync) {
			if (fs.numPendingSync == 0)
				return;
		}
		else if (fs.syncInProgress) {
			// this is to avoid indexedDB memory leak when FS.syncfs is executed before the previous one completed.
			fs.numPendingSync++;
			return;
		}

		fs.syncInProgress = true;
		FS.syncfs(false, (function(err) {
			fs.syncInProgress = false;
		}));
		fs.numPendingSync = 0;
	},
},

JS_FileSystem_HasIndexedDB: function()
{
	return !!Module.indexedDB;
},

JS_FileSystem_Sync: function()
{
	if (!Module.indexedDB)
		return;

	fs.sync(false);
},

JS_FileSystem_SetSyncInterval: function(ms)
{
	if (!Module.indexedDB)
		return;

	fs.syncIntervalID = window.setInterval(function(){
		fs.sync(true);
	}, ms);
},

};

autoAddDeps(LibraryFileSystemWebGL, '$fs');
mergeInto(LibraryManager.library, LibraryFileSystemWebGL);
