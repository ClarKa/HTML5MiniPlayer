(function() {

	// $(document).ready(function() {
	// 	alert("Drag and drop some music into this page to start!");
	// })
	var curr_audio;
	var curr_audioValue;
	var audioList = document.getElementsByTagName("audio");
	var vol = 1;
	var obj = [];
	var player = document.getElementById('player');
	var dropbox = document.getElementById('dropbox'); 
	//console.log(audioList);

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

	//intialize dropbox
	$(dropbox).zIndex(-1);
	setDropbox();
	//resize dropbox whenever window size change
	$(window).resize(function() {
		setDropbox();
	});
	
	//intialize with one song in play list
	var newNode = $('<a></a>').text('黄丽玲 - 爱上你等于爱上寂寞(live)');
	$(newNode).attr('href','#');
	$(newNode).addClass('list-group-item'); 
	$(newNode).attr('data-value',audioList.length);
	$('#playlist').append(newNode)	
	var newNode2 = $('<audio></audio>');
	$(newNode2).attr('src','test_audio/黄丽玲 - 爱上你等于爱上寂寞(live).mp3');
	$('#playlist').append(newNode2);
	$('#next').removeClass('disabled');
	$('#badge').html(audioList.length);

/*---------keep playlist in sessionStorage only works for Firefox-------------	
 	if(sessionStorage.getItem('playList')) {
		console.log('load playlist');
		loadPlaylist();
	}
*/
//-------------click playlist to play------------------------------------
	document.getElementById("playlist").addEventListener(
			"click", 
			function(event) {
				curr_audioValue = parseInt(event.target.getAttribute("data-value"));
				loadNewAudio();
			});

//-------------control buttons---------------------------------------------
	document.getElementById("play").addEventListener(
			"click",
			function() {
				if(curr_audio === undefined) {
					if(audioList.length == 0) {
						alert('Please drag some audio files into the page to add it into the playlist!');
						return
					}
					alert("Please select an audio from the playlist to play!");
					return;
				}
				play2pause();
				curr_audio.play();
			});

	document.getElementById("pause").addEventListener(
			"click",
			function() {
				pause2play();
				curr_audio.pause();
			});

	document.getElementById("stop").addEventListener(
			"click",
			function() {
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
		curr_audioValue++;
		loadNewAudio();
	});
			
	$("#prev").click(function() {
		curr_audioValue--;
		loadNewAudio();
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
	$('#volume').click(function(event) {
		var x = event.pageX;
		var offset = $(this).offset();
		vol = (x-offset.left)/$(this).width();
		var bar_width = [vol/1 * 100 + '%']
		$('#volume_bar').width(bar_width);
		if (curr_audio !== undefined) {
			curr_audio.volume = vol;
			console.log('Volume = ' + curr_audio.volume);
		}
		
		if (vol !== 0) {
			document.getElementById("volume_icon").className = "glyphicon glyphicon-volume-up col-sm-1";
		}
	});

	$('#volume_icon').click(function() {
		vol = 0;
		if (curr_audio !== undefined) {
			curr_audio.volume = vol;
		}
		console.log('Muted');
		$('#volume_bar').width("0%");

		this.className = "glyphicon glyphicon-volume-off";
	});


//--------------drag&drop to add in playlist-----------------------------
	dropbox.addEventListener(
			'drop',
			function(event) {
				event.stopPropagation();
				event.preventDefault();

				//-------create new playlist entry----------------
				var input = event.dataTransfer.files;
				for(var i=0; i<input.length; i++) {
					var name = input[i].name;
					var newNode = $('<a></a>').text(name);
					$(newNode).attr('href','#');
					$(newNode).addClass('list-group-item'); 
					$(newNode).attr('data-value',audioList.length);
					$('#playlist').append(newNode);

					//-------create new audio element-----------------
					var url = window.URL.createObjectURL(input[i]);
					var newNode2 = $('<audio></audio>');
					$(newNode2).attr('src',url);
					$('#playlist').append(newNode2);

					$('#next').removeClass('disabled');

					hideDropbox();
					$('#badge').html(audioList.length);

					//playList2JSON(name,url);
				}
				});

	dropbox.addEventListener(
			'dragover', 
			function(event) {
				event.stopPropagation();
				event.preventDefault();
			});

	dropbox.addEventListener(
			'dragenter',
			function(event) {
				showDropbox();
				event.stopPropagation();
				event.preventDefault();
			});

//---------toggle playlist icon-----------------
	// $('#playlist').position({
	// 	of: $('#main'),
	// 	my: 'left top',
	// 	at: 'right top'
	// });
	$("#slide_btn").click(function() {
		$('#playlist').slideToggle('fast');
	});
	$('#badge').html(audioList.length);
	
//--------------helper functions------------------------------------
	//set dropbox size equal to window size
	function setDropbox() {
		$(dropbox).height($(window).height());
		$(dropbox).width($(window).width());
	}
	//disable Prev/Next button while hit the top/bottom of playlist
	function addBtnListener() {
		curr_audio.onplaying = function() {
			if (curr_audioValue+1 == audioList.length) {
				$("#next").addClass("disabled");
				console.log("Next Button Disabled");
			}
			else {
				$("#next").removeClass("disabled");
			}

			if (curr_audioValue == 0) {
				$("#prev").addClass("disabled");
				console.log("Prev Button Disabled");
			}
			else {
				$("#prev").removeClass("disabled");
			}
		};
	}

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
	
	function play2pause() {
		$("#pause").removeClass("hidden");
		$("#play").addClass("hidden");
	}

	function pause2play() {
		$("#pause").addClass("hidden");
		$("#play").removeClass("hidden");
	}

	function formatTime(seconds) {
		var min = Math.floor(seconds/60);
		var sec = Math.floor(seconds%60);
		var time = [min + " : " + sec];
		return time;
	}

	function nextToPlay() {
		curr_audioValue = (curr_audioValue+1) % audioList.length;
		loadNewAudio(); 
	}

	function loadNewAudio() {
		var new_audio = audioList[curr_audioValue];
		if (curr_audio !== undefined && new_audio !== curr_audio) {
			curr_audio.load();
		}

		curr_audio = new_audio;
		play2pause();

		addTimeUpdate();
		addEndListener();
		addBtnListener();

		curr_audio.volume = vol;
		console.log('Volume = ' + curr_audio.volume);
		curr_audio.play();

		console.log(curr_audio);
		console.log(curr_audio.duration);
		var time = formatTime(curr_audio.duration);
		$("#duration").html(time);

		console.log("Now Playing " + curr_audioValue + " of " + audioList.length + " Song in the Playlist");

		//switch playlist entries between active and non-active
		if ($("#item-active") != null) {
			$("#item-active").removeClass("active");
			$("#item-active").removeAttr("id");
		}

		var tmp = $(".list-group-item")[curr_audioValue];
		$(tmp).addClass("active");
		$(tmp).attr("id","item-active");
	}

	function showDropbox() {
		$(dropbox).zIndex(1);
		$(player).zIndex(-1);
		$(dropbox).css('opacity', '0.8');
		$(dropbox).css({'background': '#F8F8FF', 'border': '8px dashed #D3D3D3', 'border-radius': '25px'});
	}

	function hideDropbox() {
		$(dropbox).zIndex(-1);
		$(player).zIndex(0);
		$(dropbox).removeAttr('style');
		setDropbox();
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
			$(newNode).attr('data-value',i);
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
