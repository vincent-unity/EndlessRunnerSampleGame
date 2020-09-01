var LibraryVideoWebGL = {
$videoInstances: [],

JS_Video_Create: function(url)
{
	var str = Pointer_stringify(url);
	var video = document.createElement('video');
	video.style.display = 'none';
	video.src = str;

	// Managing the fact that the application has detached from the video object
	// so we can prune out callbacks arriving afterwards.
	video.detached = false;

	// Enable CORS on the request fetching the video so the browser accepts
	// playing it.  This is needed since the data is fetched and used
	// programmatically - rendering into a canvas - and not displayed normally.
	video.crossOrigin = "anonymous";

	// Implementing looping ourselves instead of using the native 'loop'
	// property so we can get one 'ended' event per loop, which triggers the
	// wanted callback (and not just when the playback actually stops, as
	// HTML5's player does).
	video.looping = false;

	video.addEventListener("ended", function(evt)
	{
		if (video.looping && !video.detached)
		{
			video.play();
		}
	});

	return videoInstances.push(video) - 1;
},

JS_Video_UpdateToTexture: function(video, tex)
{
	if (videoInstances[video].lastUpdateTextureTime === videoInstances[video].currentTime)
		return false;
	GLctx.bindTexture(GLctx.TEXTURE_2D, GL.textures[tex]);
	GLctx.pixelStorei(GLctx.UNPACK_FLIP_Y_WEBGL, true);
	GLctx.texSubImage2D(GLctx.TEXTURE_2D, 0, 0, 0, GLctx.RGBA, GLctx.UNSIGNED_BYTE, videoInstances[video]);
	GLctx.pixelStorei(GLctx.UNPACK_FLIP_Y_WEBGL, false);
	videoInstances[video].lastUpdateTextureTime = videoInstances[video].currentTime;
	return true;
},

JS_Video_Destroy: function(video)
{
	videoInstances[video].detached = true;
	videoInstances[video] = null;
	// GC will take care of the rest.
},

JS_Video_Play: function(video)
{
	videoInstances[video].play();
},

JS_Video_Pause: function(video)
{
	videoInstances[video].pause();
},

JS_Video_Seek: function(video, time)
{
	videoInstances[video].currentTime = time;
},

JS_Video_SetLoop: function(video, loop)
{
	// See note in JS_Video_Create for why we use .looping instead of .loop.
	videoInstances[video].looping = loop;
},

JS_Video_SetMute: function(video, muted)
{
	videoInstances[video].muted = muted;
},

JS_Video_SetPlaybackRate: function(video, rate)
{
	videoInstances[video].playbackRate = rate;
},

JS_Video_GetNumAudioTracks: function(video)
{
	var tracks = videoInstances[video].audioTracks;
	// For browsers that don't support the audioTracks property, let's assume
	// there is one.
	return tracks ? tracks.length : 1;
},

JS_Video_GetAudioLanguageCode: function(video, trackIndex)
{
	var tracks = videoInstances[video].audioTracks;
	if (!tracks)
		return "";
	var track = tracks[trackIndex];
	return track ? track.language : "";
},

JS_Video_EnableAudioTrack: function(video, trackIndex, enabled)
{
	var tracks = videoInstances[video].audioTracks;
	if (!tracks)
		return;
	var track = tracks[trackIndex];
	if (track)
		track.enabled = enabled ? true : false;
},

JS_Video_SetVolume: function(video, volume)
{
	videoInstances[video].volume = volume;
},

JS_Video_Height: function(video)
{
	return videoInstances[video].videoHeight;
},

JS_Video_Width: function(video)
{
	return videoInstances[video].videoWidth;
},

JS_Video_Time: function(video)
{
	return videoInstances[video].currentTime;
},

JS_Video_Duration: function(video)
{
	return videoInstances[video].duration;
},

JS_Video_IsReady: function(video)
{
	// If the ready state is HAVE_ENOUGH_DATA or higher, we can start playing.
	if (!videoInstances[video].isReady &&
		videoInstances[video].readyState >= videoInstances[video].HAVE_ENOUGH_DATA)
		videoInstances[video].isReady = true;
	return videoInstances[video].isReady;
},

JS_Video_IsPlaying: function(video)
{
	var element = videoInstances[video];
	return !element.paused && !element.ended;
},

JS_Video_SetErrorHandler: function(video, ref, onerror)
{
	var instance = videoInstances[video];
	instance.onerror = function(evt)
	{
		if (!instance.detached)
		{
			dynCall('vii', onerror, [ref, evt.target.error.code]);
		}
	};
},

JS_Video_SetReadyHandler: function(video, ref, onready)
{
	var instance = videoInstances[video];
	instance.addEventListener("canplay", function(evt)
	{
		if (!instance.detached)
		{
			dynCall('vi', onready, [ref]);
		}
	});
},

JS_Video_SetEndedHandler: function(video, ref, onended)
{
	var instance = videoInstances[video];
	instance.addEventListener("ended", function(evt)
	{
		if (!instance.detached)
		{
			dynCall('vi', onended, [ref]);
		}
	});
},

JS_Video_SetSeekedOnceHandler: function(video, ref, onseeked)
{
	var instance = videoInstances[video];
	instance.addEventListener("seeked", function listener(evt)
	{
		instance.removeEventListener("seeked", listener);
		if (!instance.detached)
		{
			dynCall('vi', onseeked, [ref]);
		}
	});
},

JS_Video_CanPlayFormat: function(format)
{
	var str = Pointer_stringify(format);
	var video = document.createElement('video');
	return video.canPlayType(str) != '';
}

};
autoAddDeps(LibraryVideoWebGL, '$videoInstances');
mergeInto(LibraryManager.library, LibraryVideoWebGL);
