(function() {

	// $(document).ready(function() {
	// 	alert("Drag and drop some music into this page to start!");
	// })
	var curr_audio;
	var curr_audioURL;
	var playlist = document.getElementById('playlist');
	var audioList = [];
	var vol = 1;
	var obj = [];
	var player = document.getElementById('player');

	var dropbox = {
		box: $('html')[0],
		hidden: function() {
			$(this.box).zIndex(-1);
			$(player).zIndex(1);
			$(this.box).removeAttr('style');
			$(player).css({'opacity': '1'});
		},
		shows: function() {
			$(this.box).zIndex(1);
			$(player).zIndex(-1);	
			$(this.box).css({'background': '#F8F8FF'});	
			$(player).css({'opacity': '0.1'});
		}
	};

	//add audio node
	var newNode = $('<audio></audio>');
	$(newNode).attr('id', 'audio');
	$('#player').append(newNode);

	// make the player draggable
	$(player).draggable({containment: "window"});

	//hide/show cover
	var imgurl = '';
	imgurl =  'media/img/cover.jpg'
	$('#cover').css({'background': 'url(' + imgurl + ')', 
		'background-repeat': 'no-repeat' , 
		'background-size': 'cover', 
		'height': '80px',
		'width': '80px',
		'background-position': 'center bottom',
		'border': '2px solid #eeeeee'});
	// $('#cover').position({
	//  	of: $('#main'),
	//  	my: "right top",
	//  	at: "left top"
	//  });
	$('#cover_btn').click(function() {
		$('#cover').toggleClass('hidden');
		$('#cover_btn_icon').toggleClass('glyphicon-chevron-right');
		$('#cover_btn_icon').toggleClass('glyphicon-chevron-left');
	});

	//intialize with one song in play list
	var newNode = $('<a></a>').text('黄丽玲 - 爱上你等于爱上寂寞(live)');
	$(newNode).attr('href','#');
	$(newNode).addClass('list-group-item'); 
	$(newNode).attr('data-url','test_audio/黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	$('#playlist').append(newNode)	
	$('#audio').attr('src','test_audio/黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	$('#next').removeClass('disabled');
	$('#badge').html(playlist.childElementCount);

/*---------keep playlist in sessionStorage only works for Firefox-------------	
 	if(sessionStorage.getItem('playList')) {
		console.log('load playlist');
		loadPlaylist();
	}
*/
//-------------click playlist to play------------------------------------
	$('#playlist').click(function(event) {
		curr_audioURL = event.target.getAttribute("data-url");
		setActive(event.target);
		loadNewAudio();
	});

	$('#playlist').sortable();
	$('#playlist').disableSelection();

//-------------control buttons---------------------------------------------
	$('#play').click(function() {
		if(curr_audio === undefined) {
			if(playlist.childElementCount == 0) {
				alert('Please drag some audio files into the page to add it into the playlist!');
				return
			}
			alert("Please select an audio from the playlist to play!");
			return;
		}
		play2pause();
		curr_audio.play();
	});

	$('#pause').click(function() {
		pause2play();
		curr_audio.pause();
	});

	$('#stop').click(function() {
		if(curr_audio === undefined) {
			alert("Please select an audio from the playlist to play!");
			return;
		}
		pause2play();
		curr_audio.load();
		$("#current").html(formatTime(0));
		$("#progress_bar").width('0%');
	});
	
	$("#next").click(function() {
		nextToPlay();	
	});
			
	$("#prev").click(function() {
		prevToPlay();	
	});	

//-------------Skip by click Progress bar--------------------------------
	$('#progress').click(function(event) {
		var x = event.pageX;
		var offset = $(this).offset();
		if (curr_audio !== undefined) {
			curr_audio.currentTime = (x-offset.left)/$(this).width()*curr_audio.duration;
			console.log("skip to " + curr_audio.currentTime);
		}
	});

//---------------volume control-------------------------------
	var vol_tmp = 1;
	$('#volume').click(function(event) {
		var x = event.pageX;
		var offset = $(this).offset();
		vol = (x-offset.left)/$(this).width();
		vol_tmp = vol;
		var bar_width = [vol/1 * 100 + '%']
		$('#volume_bar').width(bar_width);
		if (curr_audio !== undefined) {
			curr_audio.volume = vol;
			console.log('Volume = ' + curr_audio.volume);
		}
		
		if (vol !== 0) {
			document.getElementById("volume_icon").className = "glyphicon glyphicon-volume-up col-sm-1";
		}
		toggleVolumeIconTooltip();
	});

	$('#volume_icon').click(function() {
		if (!vol) {
			vol = vol_tmp;
			if (curr_audio !== undefined) {
				curr_audio.volume = vol;	
			}	
			var bar_width = [vol/1 * 100 + '%'];
			$('#volume_bar').width(bar_width);
			toggleVolumeIconTooltip();
		}
		else {
			vol = 0;
			if (curr_audio !== undefined) {
				curr_audio.volume = vol;
			}
			console.log('Muted');
			$('#volume_bar').width("0%");
			toggleVolumeIconTooltip();
		}
		
		$(this).toggleClass("glyphicon glyphicon-volume-up");
		$(this).toggleClass("glyphicon glyphicon-volume-off");
	});

	
	$('#volume_icon').tooltip();
	$('#volume_icon').attr('title', 'mute');

//--------------drag&drop to add in playlist-----------------------------
	dropbox.box.addEventListener(
			'drop',
			function(event) {
				event.stopPropagation();
				event.preventDefault();

				//-------create new playlist entry----------------
				var input = event.dataTransfer.files;
				for(var i=0; i<input.length; i++) {
					var name = input[i].name;
					var newNode = $('<a></a>').text(name);
					var url = window.URL.createObjectURL(input[i]);
					$(newNode).attr('href','#');
					$(newNode).addClass('list-group-item'); 
					$(newNode).attr('data-url',url);
					$('#playlist').append(newNode);				
					
				}
				dropbox.hidden();
				$('#badge').html(playlist.childElementCount);	
				$('#next').removeClass('disabled');
				//playList2JSON(name,url);
			});

	dropbox.box.addEventListener(
			'dragover', 
			function(event) {
				event.stopPropagation();
				event.preventDefault();
				dropbox.shows();
			});

	dropbox.box.addEventListener(
			'dragenter',
			function(event) {
				event.stopPropagation();
				event.preventDefault();
			});

	dropbox.box.addEventListener(
			'dragleave',
			function(event) {
				event.stopPropagation();
				event.preventDefault();
				dropbox.hidden();
			});

//---------toggle playlist--------------------------
	$("#slide_btn").click(function() {
		$('#playlist').slideToggle('fast');
	});
	$('#badge').html(playlist.childElementCount);
	
//--------------helper functions------------------------------------
	//set tooltip text
	function toggleVolumeIconTooltip () {
		if(!vol) {
			$('#volume_icon').attr('title', 'unmute');
		}
		else {
			$('#volume_icon').attr('title', 'mute');
		}	
	}

	// //disable Prev/Next button while hit the top/bottom of playlist
	// function addBtnListener() {
	// 	curr_audio.onplaying = function() {
	// 		if (nextToPlay === false) {
	// 			$("#next").addClass("disabled");
	// 			console.log("Next Button Disabled");
	// 		}
	// 		else {
	// 			$("#next").removeClass("disabled");
	// 		}

	// 		if (prevToPlay === false) {
	// 			$("#prev").addClass("disabled");
	// 			console.log("Prev Button Disabled");
	// 		}
	// 		else {
	// 			$("#prev").removeClass("disabled");
	// 		}
	// 	};
	// }

	//time update
	function addTimeUpdate() {
		curr_audio.ontimeupdate = function(){
			var cur = curr_audio.currentTime;
			var bar_width = [cur/curr_audio.duration*100 + '%'];
			$("#current").html(formatTime(cur));
			$("#progress_bar").width(bar_width);
		};
	}

	//automatic play the next track
	function addEndListener() {
		curr_audio.onended = function(){
		pause2play();
		nextToPlay();
		};
	}

	function pause2play() {
		$("#pause").addClass("hidden");
		$("#play").removeClass("hidden");
	}

	function play2pause() {
		$("#pause").removeClass("hidden");
		$("#play").addClass("hidden");
	}

	function formatTime(seconds) {
		var min = Math.floor(seconds/60);
		var sec = Math.floor(seconds%60);
		var time = [min + " : " + sec];
		return time;
	}

	function nextToPlay() {
		var nextSib = document.getElementById('item-active').nextSibling;
		if (nextSib === undefined || nextSib === null) {
			nextSib = playlist.firstChild;
		}
		curr_audioURL = nextSib.getAttribute('data-url');
		loadNewAudio();
		setActive(nextSib);
	}

	function prevToPlay() {
		var prevSib = document.getElementById('item-active').previousSibling;
		if (prevSib === undefined || prevSib === null) {
			prevSib = playlist.lastChild;
		}
		curr_audioURL = prevSib.getAttribute('data-url');
		loadNewAudio(); 
		setActive(prevSib);
	}

	function loadNewAudio() {
		//-------create new audio element-----------------	
		if (curr_audio !== undefined) {
			var tmp = curr_audio.getAttribute('src');

			if (curr_audio.getAttribute('src') === curr_audioURL) {
				curr_audio.play();
				return;	
			}
			curr_audio.load();
		}
		
		play2pause();
		$('#audio').attr('src',curr_audioURL);	

		curr_audio = $('audio')[0];


		addTimeUpdate();
		addEndListener();
		// addBtnListener();
		curr_audio.volume = vol;
		console.log('Volume = ' + curr_audio.volume);
		curr_audio.play();

		console.log(curr_audio);
		console.log(curr_audio.duration);
		var time = formatTime(curr_audio.duration);
		// $("#duration").html(time);

		console.log("Now Playing " + curr_audioURL);
	}

	function setActive(that) {
		if ($("#item-active") != null) {
			$("#item-active").removeClass("active");
			$("#item-active").removeAttr("id");
		}

		$(that).addClass("active");
		$(that).attr("id","item-active");
	}


	function playList2JSON(name, url) {
		var tmp = {
			text: name,
	  		audioUrl: url		
		};
		obj.push(tmp);

		console.log(obj);
		if (typeof(Storage) !== undefined) {
			sessionStorage.setItem('playList', JSON.stringify(obj));
			console.log("wrote in sessionStorge!");
		}
		else {
			alert('Browser does not support localStorage/sessionStorage');
			return;
		}
	}

	function loadPlaylist() {
		var parse = JSON.parse(sessionStorage.getItem('playList'));
		//-------create new playlist entry----------------
		for (var i=0;i<parse.length;i++) {
			var name = parse[i].text;
			var newNode = $('<a></a>').text(name);
			$(newNode).attr('href','#');
			$(newNode).addClass('list-group-item'); 
			$(newNode).attr('data-url',i);
			$('#playlist').append(newNode);

			//-------create new audio element-----------------
			var url = parse[i].audioUrl;
			var newNode2 = $('<audio></audio>');
			$(newNode2).attr('src',url);
			$('#playlist').append(newNode2);
		}
	}

	function clearPlaylist() {
		localStorage.clear();
		sessionStorage.clear();
	}


}) ();
