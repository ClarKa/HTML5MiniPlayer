(function() {

	// $(document).ready(function() {
	// 	alert("Drag and drop some music into this page to start!");
	// })
	var vol = 1;
	var playlist = document.getElementById('playlist');
	var player = document.getElementById('player');
	var obj = [];

	var currAudio = {
		file: null,
		url: '',
		filePlay: function() {
			if(this.file === null) {
				if(playlist.childElementCount == 0) {
					alert('Please drag some audio files into the page to add it into the playlist!');
					return
				}
				alert("Please select an audio from the playlist to play!");
				return;
			}
			play2pause();
			this.file.play();
		},
		filePause: function() {
			pause2play();
			this.file.pause();
		},
		fileStop: function() {
			
			pause2play();
			this.file.load();
			$("#current").html(formatTime(0));
			$("#progress_bar").width('0%');		
		},
		fileNext: function() {
			nextToPlay();
		},
		filePrev: function() {
			prevToPlay();
		}
	}

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
		'height': '87px',
		'width': '87px',
		'background-position': 'center bottom',
		'border': '2px solid #eeeeee'});

	$('#cover_btn').click(function(event) {
		event.preventDefault;
		$('#cover').toggleClass('hidden');
		$('#cover_btn_icon').toggleClass('glyphicon-chevron-right');
		$('#cover_btn_icon').toggleClass('glyphicon-chevron-left');
	});

	//intialize with one song in play list
	var newNode = $('<a></a>').text('黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	$(newNode).attr('href','#');
	$(newNode).addClass('list-group-item'); 
	$(newNode).attr('data-url','test_audio/黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	var newNode2 = $('<span></span>');
	$(newNode2).addClass('glyphicon glyphicon-minus');
	$(newNode).append(newNode2);	

	$(playlist).append(newNode)	
	$('#audio').attr('src','test_audio/黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	$('#next').removeClass('disabled');
	$('#badge').html(playlist.childElementCount);

// //---------keep playlist in sessionStorage only works for Firefox-------------	
//  	if(sessionStorage.getItem('playList')) {
// 		console.log('load playlist');
// 		loadPlaylist();
// 	}

//--------------------Playlist------------------------------------
	//click playlist to play
	$(playlist).click(function(event) {
		if(event.target.hasAttribute('href')) {
			currAudio.url = event.target.getAttribute("data-url");
			setActive(event.target);
			loadNewAudio();	
		}
		else {
			//remove from playlit
			var nodeToDelete = event.target.parentElement;
			if(currAudio.file !== null) {
				currAudio.fileStop();
				currAudio.file = null;
				playlist.removeChild(nodeToDelete);	
				// nextToPlay();
			}
			else {
				playlist.removeChild(nodeToDelete);		
			}
			$('#badge').html(playlist.childElementCount);
		}

	});

	$(playlist).sortable();
	$(playlist).disableSelection();

	//toggle playlist
	$("#slide_btn").click(function() {
		$(playlist).slideToggle('fast');
	});
	$('#badge').html(playlist.childElementCount);
	$('#slide_btn').tooltip();
	$('#slide_btn').attr('title', 'drag audio files into this page to add them into the playlist');

//-------------control buttons---------------------------------------------
	$('#play').click(function() {
		currAudio.filePlay();
	});

	$('#pause').click(function() {
		currAudio.filePause();
	});

	$('#stop').click(function() {
		currAudio.fileStop();
	});
	
	$("#next").click(function() {
		currAudio.fileNext();	
	});
			
	$("#prev").click(function() {
		currAudio.filePrev();	
	});	

//-------------Skip by click Progress bar--------------------------------
	$('#progress').click(function(event) {
		var x = event.pageX;
		var offset = $(this).offset();
		if (currAudio.file !== null) {
			currAudio.file.currentTime = (x-offset.left)/$(this).width()*currAudio.file.duration;
			console.log("skip to " + currAudio.file.currentTime);
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
		if (currAudio.file !== null) {
			currAudio.file.volume = vol;
			console.log('Volume = ' + currAudio.file.volume);
		}
		
		if (vol !== 0) {
			document.getElementById("volume_icon").className = "glyphicon glyphicon-volume-up col-sm-1";
		}
		toggleVolumeIconTooltip();
	});

	$('#volume_icon').click(function() {
		if (!vol) {
			vol = vol_tmp;
			if (currAudio.file !== null) {
				currAudio.file.volume = vol;	
			}	
			var bar_width = [vol/1 * 100 + '%'];
			$('#volume_bar').width(bar_width);
			toggleVolumeIconTooltip();
		}
		else {
			vol = 0;
			if (currAudio.file !== null) {
				currAudio.file.volume = vol;
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
					console.log(input[i]);
					$(newNode).attr('href','#');
					$(newNode).addClass('list-group-item'); 
					$(newNode).attr('data-url',url);
					$(newNode).attr('data-type',input[i].type);

					var newNode2 = $('<span></span>');
					$(newNode2).addClass('glyphicon glyphicon-minus');
					$(newNode).append(newNode2);	

					$(playlist).append(newNode);				
				}
				dropbox.hidden();
				$('#badge').html(playlist.childElementCount);	
				$('#next').removeClass('disabled');

				// playList2JSON(name,url);	
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
	// 	currAudio.file.onplaying = function() {
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
		currAudio.file.ontimeupdate = function(){
			var cur = currAudio.file.currentTime;
			var bar_width = [cur/currAudio.file.duration*100 + '%'];
			$("#current").html(formatTime(cur));
			$("#progress_bar").width(bar_width);
		};
	}

	//automatic play the next track
	function addEndListener() {
		currAudio.file.onended = function(){
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
		var nextSib = document.getElementById('item-active').nextElementSibling;
		if (nextSib === undefined || nextSib === null) {
			nextSib = playlist.firstChild;
		}
		currAudio.url = nextSib.getAttribute('data-url');
		loadNewAudio();
		setActive(nextSib);
	}

	function prevToPlay() {
		var prevSib = document.getElementById('item-active').previousElementSibling;
		if (prevSib === undefined || prevSib === null) {
			prevSib = playlist.lastChild;
		}
		currAudio.url = prevSib.getAttribute('data-url');
		loadNewAudio(); 
		setActive(prevSib);
	}

	function loadNewAudio() {
		//-------create new audio element-----------------	
		if (currAudio.file !== null) {
			var tmp = currAudio.file.getAttribute('src');

			if (currAudio.file.getAttribute('src') === currAudio.url) {
				currAudio.filePlay();
				return;	
			}
			currAudio.file.load();
		}
		
		$('#audio').attr('src',currAudio.url);	
		$('#audio').attr('src',currAudio.url);

		currAudio.file = $('audio')[0];
		console.log(currAudio.file);

		addTimeUpdate();
		addEndListener();
		currAudio.file.volume = vol;
		console.log('Volume = ' + currAudio.file.volume);
		currAudio.filePlay();

		console.log(currAudio.file.duration);
		var time = formatTime(currAudio.file.duration);
		// $("#duration").html(time);
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
			var url = parse[i].audioUrl;
			var newNode = $('<a></a>').text(name);
			$(newNode).attr('href','#');
			$(newNode).addClass('list-group-item'); 
			$(newNode).attr('data-url',url);
			$(playlist).append(newNode);
		}
	}

	function clearPlaylist() {
		localStorage.clear();
		sessionStorage.clear();
	}

}) ();
