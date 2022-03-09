function getIEV(){
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    
      var rv = 9; // Return value assumes failure.
      if (navigator.appName == 'Microsoft Internet Explorer')
      {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
          rv = parseFloat( RegExp.$1 );
      }
      return rv;
    }
    
    
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    if(isiPad)
    {
        var isiPad1 = navigator.userAgent.match(/8F190/i) != null;
        if(!isiPad1) isiPad1 = navigator.userAgent.match(/9B206/i) != null;
    }
    
    var isiPhone = navigator.userAgent.match(/iPhone/i) != null;
    var isAndroid = navigator.userAgent.match(/Android/i) != null;
    var isWindowsPhone = navigator.userAgent.match(/Windows Phone/i) != null;
    
    //alert(navigator.userAgent);
    
    function episode(title, useTitle, id, thumb, vic)
    {
     this.title = title;
     this.useTitle = useTitle;
     this.id = id;
     this.thumb = thumb;
     this.vic = vic;
    }
    
    currVid = -1,
    prevVid = -1,
    wW = 0, 
    wH = 0,
    sW = 0, // scrub width
    mC = 0, // max content
    cC = $('#content .content').length,
    pC = -2, 
    tPC = 0,
    audiobed = {},
    player = null,
    autoPlayVid = false,
    fadeOut = 0,
    audioFade = 0,
    showVideo = 0,
    volume = 100,
    ver = 9;
    done = "false",
    maskOut = false,
    dir = "",
    embed = "",
    circleMenuVisible = false,
    touch = false;
    
    if(navigator.msMaxTouchPoints) touch = true;
    
    if(navigator.userAgent.indexOf( "MSIE" ) != -1)
    {
        browser = "bad";
        ver = getIEV();
        if(ver > 8) browser = "html5";
        
    } else if ( navigator.userAgent.indexOf( "Firefox" ) != -1  ||  navigator.userAgent.indexOf( "Chrome" ) != -1  ||  navigator.userAgent.indexOf( "Safari" ) != -1 )
    {
        browser = "html5";
    } 
    
    switch(browser)
    {
    
        case "bad":
            embed = '<object width="0%" height="0%"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /> <param name="movie" value="flash/videoPlayerBG.swf" /><param wmode="transparent"><embed src="flash/videoPlayerBG.swf" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="0%" height="0%" wmode="transparent"></embed></object>';
            //embed = '<object width="100%" height="100%"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /> <param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=62209992&amp;server=vimeo.com&amp;color=000&amp;fullscreen=1&amp;loop=1&amp;autoplay=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;controls=0" /><param wmode="transparent"><embed src="http://vimeo.com/moogaloop.swf?clip_id=62209992&amp;server=vimeo.com&amp;color=000000&amp;fullscreen=1&amp;loop=1&amp;autoplay=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;controls=0" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="100%" height="100%" wmode="transparent"></embed></object>';
            //embed = '<object width="100%" height="100%"><param name="movie" value="http://www.youtube.com/v/'+ vidId +'?modestbranding=1&amp;hd=1&amp;version=3&amp;hl=en_US&amp;autoplay=1&amp;annotations=0&amp;loop=1&amp;controls=0&amp;showinfo=0&amp;playlist='+ vidId +'&iv_load_policy=3"></param><param wmode="transparent"><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/'+ vidId +'?modestbranding=1&amp;hd=1&amp;version=3&amp;hl=en_US&amp;autoplay=1&amp;annotations=0&amp;controls=0&amp;loop=1&amp;showinfo=0&amp;playlist='+ vidId +'&iv_load_policy=3" type="application/x-shockwave-flash" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="true" wmode="transparent"></embed></object>';
            break;
    
    }
    
    
    if(isiPad || isiPhone || isAndroid)  embed = '<div class="playButton"><img src="images/playButton.png" /></div>';
    
    function getScreenSize()
    {
        wH = $(window).height();
        wW = $(window).width();
        //console.log(wW + ' ' + window.screen.width);
        
    }
    
    function setSize()
    {
        getScreenSize();
        $("#page").css({"width" : wW+"px", "height" : wH + "px"});
        
    
        $("#intro").css({"width" : wW+"px"});
        if(maskOut == true) $("#intro").css({"left" : "-" + wW + "px"});
        if(wW < 768)
        {
            $("#contentTop").css({"width" : wW+"px"});
            $("#contentBot").css({"width" : wW+"px"});
        }
        if($("#videoListing").length != 0) {
            if(isiPad || isiPhone || isAndroid || isWindowsPhone || touch) { } else { updateScroll(); }
        }
    
        $('#instant-crush').css({
            width: $('#intro .getlucky').width() - 100 + 'px',
            height: Math.floor(($('#intro .getlucky').width() - 100) * 0.5626) + 'px'
        })
            .width($('#intro .getlucky').width() - 100)
            .height(Math.floor(($('#intro .getlucky').width() - 100) * 0.5626))
            .attr('width', $('#intro .getlucky').width() - 100)
            .attr('height', Math.floor(($('#intro .getlucky').width() - 100) * 0.5626))
    }
    
    function updateScroll()
    {
    
        $(".thumbContent").css("height", wH + 'px');
        $(".clsSlim_dvScrollTest").css("height",$('.thumbContent').height() + 'px');
    }
    
    window.onresize = function() { setSize(); setVideo();}
    
    function loadIndex()
    {
        for(var x in videos)
        {
            video = videos[x];
        }
    }
    
    $(function() {
    /*
        var tempQ = QueryString.episode;
        if(typeof tempQ != 'undefined')
        {
            var tempId = parseInt(tempQ) - 1;
            if(tempId > -1 && tempId <= videos.length - 1) {
                initVid = tempId;
            } else { 
                initVid = 0;
            }
            autoPlayVid = true;
        } else {
            initVid = videos.length - 1;
        }
    */	
        setSize();
    
        $('#audioDiv').html(embed);
    
        // if(browser != "bad")
        if(false)
        {
            //<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F91627302%3Fsecret_token%3Ds-DBcTI"></iframe>
            if(isiPad || isiPhone || isAndroid) {
                var scurl = 'http://api.soundcloud.com/tracks/107345077?client_id=d49eaee6a747042fcabd46379401a4dd&secret_token=s-0Vkez';
                var scurlst = 'http://api.soundcloud.com/tracks/107345077/stream?client_id=d49eaee6a747042fcabd46379401a4dd&secret_token=s-0Vkez';
            } else {
                var scurl = 'http://api.soundcloud.com/tracks/107345077?client_id=d49eaee6a747042fcabd46379401a4dd&secret_token=s-0Vkez';
                var scurlst = 'http://api.soundcloud.com/tracks/107345077/stream?client_id=d49eaee6a747042fcabd46379401a4dd&secret_token=s-0Vkez';
            }
            SC.initialize({ client_id: "d49eaee6a747042fcabd46379401a4dd"});
            SC.get(scurl, function(track, error) {
              if (error) { go(); } else {
    
                SC.stream(scurlst, {
                    autoPlay: true
                }, function(sound) {
                    audiobed = sound;
                    //console.log(audiobed);
                    if(isiPad || isiPhone || isAndroid){
                        $('#audioDiv').click(function() {
                            sound.togglePause();
                            setTimeout(function() { sound.togglePause(); }, 1);
                            go();
                            return false;
                        });
                    } else {
                        go();
                    }
    
                });
                }
            });
        } else { 
            go();
        }
    
    });
    
    function fadeAudio()
    {
        audioFade = setInterval(function() { 
            if(volume > 0)
            {	
                volume = volume - 5;
                audiobed.setVolume(volume);
            } else {
                clearInterval(audioFade);
            }
        }, 250);
    }
    
    function go()
    {
        $('#intro').show();
        $('#audioDiv').hide();
        //$('#intro .logo').fadeIn(2000);
        $('#intro .guy').show();
        $('#intro .thomas').show();
        // setTimeout(function() {
        // 	$('#intro .guy').fadeIn(4000);
        // 	$('#intro .thomas').fadeIn(4000);
        // }, 500);
        setTimeout(function() {
            
            $('#intro .thomas').animate({
                left: '-2%'
            }, {
                duration: 5000,
                easing: 'linear'
            });
            $('#intro .shadowl').animate({
                left: '-2%'
            }, {
                duration: 5000,
                easing: 'linear'
            });
            $('#intro .shadowr').animate({
                right: '-1%'
            }, {
                duration: 5000,
                easing: 'linear'
            });
            $('#intro .guy').animate({
                right: '-1%'
            }, {
                duration: 5000,
                easing: 'linear',
                complete: function() {
    
                }
            });
        }, 1000);
    
        setTimeout(function() {
            $('#intro .getlucky').show();
        }, 1000);
        
        setTimeout(function() {
                done = "true";
                $('#contentTop').fadeIn(3000, function() { $('#contentTop > div.announce').on("click", function() { nextVid('right', autoPlayVid) }).css({'cursor': 'pointer'}); });
                $('#contentBot').fadeIn(3000);
                $('#deluxe-box').fadeIn(3000);
                buildVideoPane(); 
                $(".controls.right").fadeIn(3000);
                $(".controls.right").on("click", function() { nextVid('right'); });
                // showVideo = setTimeout(function() {
                    // nextVid('right', autoPlayVid);
                // }, 4000);
        }, 6000);
    
    }
    
    
    function setFade()
    {
        fadeOut = setTimeout(function() {
            hideContent();
            //console.log('fade');
        }, 1500);
    }
    
    function killFade()
    {
        clearTimeout(fadeOut);
    }
    
    
    function videoautoheight(){
        $(".video object, .video embed, .video .format-video iframe, .video iframe").each(function() {
            
            var orig = $(this);
            var ratio = orig.attr("height") / orig.attr("width");
            var parWidth = $(".video").width();
            var parHeight = $(".video").height(); 
            if(orig.attr("width") != parWidth) {
                orig.attr("width", parWidth).attr("height", parHeight);
            }
        });
    }
    
    
    function nextVid(dir, autoplay)
    {
        autoplay = typeof autoplay !== 'undefined' ? autoplay :false;
        
        //console.log('pre '+ dir + ' prev ' + prevVid +' curr ' + currVid);
        // Kill controls until animation is complete
        $(".controls").each(function () { $(this).off("click")});
        
        
        // Set current video to previous choice
        
        
        // Determine which direction to slide
        switch(dir)
        {
            case "right":
                if(maskOut == false)
                {
                    if(currVid < 0) currVid = initVid;
                    slideMask(dir);
                    placeVid(dir, currVid, autoplay);
                    $(".controls.right").fadeIn();
                    $(".controls.left").fadeIn();
                } else {
    
                    // Slide out old video
                    slideVid(dir, prevVid);
    
                    // Make new video
                    placeVid(dir, currVid, autoplay);
    
                    //if((currVid + 1) == videos.length) $(".controls.right").fadeOut();
                
                }
                //console.log('post '+ dir + ' prev ' + prevVid +' curr ' + currVid);
                break;
            
            case "left":
                if(maskOut == true)
                {
                    // Slide out old video
                    slideVid(dir, prevVid);				
                    slideMask(dir);
                    $(".controls.left").fadeOut();
                    currVid = -1;
                    //console.log('last vid ' + currVid);
                } else {
    
                        // Slide out old video
                        slideVid(dir, prevVid);
                        
                        // Make new video
                        placeVid(dir, currVid, autoplay);
                        
                        if($(".controls.right").is(':hidden')) $(".controls.right").fadeIn();
                    
                }
                //console.log('post '+ dir + ' prev ' + prevVid +' curr ' + currVid);
                break;
                
        }
        prevVid = currVid;
    }
    
    function slideVid(dir, id, autoplay)
    {
        autoplay = typeof autoplay !== 'undefined' ? autoplay : false;
        // Get position and check if it should be removed
        var divPos = $("#vid_"+id).position();
    
        
        // which way to slide
        switch(dir)
        {
            case "right":
                var divLeft = divPos.left - $("#vid_"+id).width();
                break;
                
            case "left":
                var divLeft = divPos.left + $("#vid_"+id).width();
                break;
        }
    
    
        //Slide it	
        $("#vid_"+id).animate({
            left: divLeft + 'px'
        }, {
            duration: 1500,
            easing: 'swing',
            complete: function() {
                if($(this).attr('vid') != currVid) 
                {
                    //console.log($(this).attr('vid') + ' removed');
                    $(this).remove();
                } else {
                    //if(autoplay == true) loadVid(currVid);
                    $(".controls.left").on("click", function() { currVid = 0; nextVid('left'); });
                    $(".controls.right").on("click", function() { togglePane(); });
                }
            }
        });
    }
    
    function showContent()
    {
    
        killFade();
        if($('#contentTop > div.ram').is(':hidden')){
            $('#contentTop').children().each( function() { $(this).fadeIn('1000'); });
            /*
            $('#contentBot > div.footer').fadeIn('1000');
            if(circleMenuVisible == true)
            {
                $('#contentBot ul').fadeIn('1000');
            } else {
                $('#contentBot > div#menuIE').fadeIn('1000');
            }
            */
        }
    }
    
    function hideContent()
    {
        killFade();
        if($('#contentTop > div.ram').is(':visible')){
            $('#contentTop').children().each( function() { $(this).fadeOut('1000'); });
            /*
            $('#contentBot > div.footer').fadeOut('1000');
            if(circleMenuVisible)
            {
                $('#contentBot ul').fadeOut('1000');
            } else {
                $('#contentBot > div#menuIE').fadeOut('1000');
            }
            */
        }
    }
    
    function slideMask(dir)
    {
        // Fade Music
        fadeAudio();
        
        // Get position and check if it should be removed
        var divPos = $("#intro").position();
        
        // which way to slide
        switch(dir)
        {
            case "right":
                var divLeft = divPos.left - $("#intro").width();
                break;
                
            case "left":
                maskOut = false;
                var divLeft = divPos.left + $("#intro").width();
                if($("#videoListing").css("right") == "0px") togglePane();
                break;
        }
    
    
        //Slide it	
        $("#intro").animate({
            left: divLeft + 'px'
        }, {
            duration: 1500,
            easing: 'swing',
            complete: function() {
                switch(dir)
                {
                    case "right":
                        maskOut = true;
                        /*
                        killFade();
                        
                        $('#contentTop').on("mouseenter", function(){
                            showContent();
                        }).on("mouseleave", function(){
                            setFade();
                        });
    
    
                        $('#contentBot').on("mouseenter", function(){
                            showContent();
                        }).on("mouseleave", function(){
                            setFade();
                        });
    */
                        break;
                    
                    case "left":
                        
                        $(".controls.right").on("click", function() { nextVid('right'); });
                        break;
                }
                //if(isiPhone || isAndroid || isiPad1) audiobed.stop();
            }
        });
        switch(dir)
        {
            case "right":
                hideContent();
                break;
    
            case "left":
            /*
                killFade();
    
                if($('#contentTop > div.ram').is(':animated')){
                    $('#contentTop').children().each().stop();
                    $('#contentBot').children().each().stop();
                }
    
                $('#contentTop').off("mouseenter").off("mouseleave");
                $('#contentBot').off("mouseenter").off("mouseleave");
            */	
                showContent();
                break;
        }
    }
    
    function placeVid(dir, vId, autoplay)
    {
        // http://img.youtube.com/vi/'+ videos[vId].id +'/hqdefault.jpg ;
        autoplay = typeof autoplay !== 'undefined' ? autoplay : false;
        
        embed = '<div id="vid_'+ vId +'" class="videoDiv" vid="'+ vId +'">';
        if(isiPhone || isAndroid || isiPad1 || isWindowsPhone) {
            //embed += '<div class="videoTitle">'+ videos[vId].title +'</div>';
        }
        embed += '<div class="videoThumb"><img src="' + videos[vId].vic +'" /></div>';
        embed += '<div class="video"><div id="vCont_'+ vId +'">';
        embed +='</div></div></div>';
        
        
        $('#page').append(embed);
        
        if(isiPhone || isAndroid || isiPad1 || isWindowsPhone){
            $("#vid_"+vId+" > div.videoThumb").on("click", function () { 
                document.location.href ='https://www.youtube.com/watch?v='+ videos[vId].id;
            });
        } else {
            $("#vid_"+vId+" > div.videoThumb").hide();
            loadVid(vId);
        }
        
        setVideo();
        switch(dir)
        {
            case "right":
                var divLeft = wW;
                break;
                
            case "left":
                var divLeft = wW * -1;
                break;
        }
            
        $("#vid_"+vId).css({"left" : divLeft + "px"});
        
        // Slide in new video
        slideVid(dir, vId, autoplay);
    
    }
    
    
    function loadVid(vId)
    {
        
        player = new YT.Player('vCont_' + vId, {
          height: '100%',
          width: '100%',
          playerVars: {
                      controls: 1,
                      autoplay: 0,
                      showinfo: 0 ,
                      annotations: 0,
                      rel: 0,
                      seamless: 1,
                      vq : 'hd720',
                      modestbranding: 1,
                      wmode: 'transparent'
                 },
          videoId: '' + videos[vId].id+ '',
          events: {
            'onReady': onPlayerReady
          }
        });
        $("#vid_"+vId+" > div.videoThumb").fadeOut(1000, function () { $(this).remove() });
    }
    
    function onPlayerReady(event) {
    
        setVideo();
        if(browser== "bad") fix_flash();
        //event.target.playVideo();
    }
    
    function buildVideoPane()
    {
        for(var v in videos)
        {
            vid = videos[v];
    
            if(vid.thumb == ""){
                img = 'https://img.youtube.com/vi/'+ vid.id +'/hqdefault.jpg';
            } else {
                img = vid.thumb;
            }
            
            var html = '<div class="thumbVideo" id="'+ v +'"><div class="thumbImage"><img src="'+ img +'" />';
            
            if(vid.useTitle == "yes") html += '<div class="thumbTitle">'+ vid.title +'</div>';
            
            html+= '</div></div>';
            
            
            $(".thumbContent").append(html);
            
            if(vid.id)
            {
                $(".thumbContent > div#"+ v +"").on("click", function() {
                    var id = $(this).attr("id");
                    if(isiPhone || isAndroid || isiPad1 || isWindowsPhone){
                        document.location.href ='https://www.youtube.com/watch?v='+ videos[id].id;
                    } else {
                        if(currVid == id)
                        {
                            loadVid(id)
                        } else {
                            currVid = id;
                            nextVid('right', true)
                        }
                        togglePane();
                    }
                });
            }
        }
        if(isiPad || isiPhone || isAndroid || isWindowsPhone || touch) 
        {
            
        } else {
            $("#videoListing").css({"overflow-y" : "hidden" });
            $(".thumbContent").slimScroll({id: 'dvScrollTest', height: wH});
        }
    }
    
    function togglePane()
    {
    
        var pane = $("#videoListing");
        var n = pane.css("right").lastIndexOf('px');
        var panePos = parseInt(pane.css("right").substring(0, n));
    
        if(panePos < 0)
        {
    
            if(pane.is(":animated")) pane.stop();
            pane.animate({
                right: '0px'
            }, {
                duration: 500,
                easing: 'swing'
            });
        } else {
            if(pane.is(":animated")) pane.stop();
            pane.animate({
                right: '-340px'
            }, {
                duration: 500,
                easing: 'swing',
                complete: function() {  }
            });		
        }
    }
    
    function setVideo()
    {
        getScreenSize();
        $("div.videoDiv").css({"width" : wW+"px", "height" : wH + "px"});
        var thisRatio = 0.7;
        if(window.screen.width == 1366 && window.screen.height == 768) thisRatio = 0.6;
        newW = wW * thisRatio;
        newH = newW * 9 / 16;  // Video aspect ratio
        newTH = newW * 9 / 16; // Thumbnail aspect ratio
        
        $('.video').css({
            "height" : newH +"px",
            "width" : newW +"px",
            "left" : (wW / 2) - (newW / 2) +"px",
            "top" : (wH / 2) - (newH / 2) +"px"});
    
        $('div.videoThumb').css({
            "height" : newTH +"px",
            "width" : newW +"px",
            "left" : (wW / 2) - (newW / 2) +"px",
            "top" : (wH / 2) - (newTH / 2) +"px"});
        
        videoautoheight();
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    var QueryString = function () {
      // This function is anonymous, is executed immediately and 
      // the return value is assigned to QueryString!
      var query_string = {};
      var query = window.location.search.substring(1);
      //console.log('query' +query);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]], pair[1] ];
          query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
          query_string[pair[0]].push(pair[1]);
        }
      } 
        return query_string;
    } ();
    
    
    function fix_flash() {
        // loop through every embed tag on the site
        var videoE = document.getElementById('video');
        var embeds = videoE.getElementsByTagName('embed');
        for (i = 0; i < embeds.length; i++) {
        embed = embeds[i];
        var new_embed;
        // everything but Firefox & Konqueror
        if (embed.outerHTML) {
            var html = embed.outerHTML;
            // replace an existing wmode parameter
            if (html.match(/wmode\s*=\s*('|")[a-zA-Z]+('|")/i))
            new_embed = html.replace(/wmode\s*=\s*('|")window('|")/i, "wmode='transparent'");
            // add a new wmode parameter
            else
            new_embed = html.replace(/<embed\s/i, "<embed wmode='transparent' ");
            // replace the old embed object with the fixed version
            embed.insertAdjacentHTML('beforeBegin', new_embed);
            embed.parentNode.removeChild(embed);
        } else {
            // cloneNode is buggy in some versions of Safari & Opera, but works fine in FF
            new_embed = embed.cloneNode(true);
            if (!new_embed.getAttribute('wmode') || new_embed.getAttribute('wmode').toLowerCase() == 'window')
            new_embed.setAttribute('wmode', 'transparent');
            embed.parentNode.replaceChild(new_embed, embed);
        }
        }
        // loop through every object tag on the site
        var videoE = document.getElementById('video');
        var objects = videoE.getElementsByTagName('object');
        for (i = 0; i < objects.length; i++) {
        object = objects[i];
        var new_object;
        // object is an IE specific tag so we can use outerHTML here
        if (object.outerHTML) {
            var html = object.outerHTML;
            // replace an existing wmode parameter
            if (html.match(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")[a-zA-Z]+('|")\s*\/?\>/i))
            new_object = html.replace(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")window('|")\s*\/?\>/i, "<param name='wmode' value='transparent' />");
            // add a new wmode parameter
            else
            new_object = html.replace(/<\/object\>/i, "<param name='wmode' value='transparent' />\n</object>");
            // loop through each of the param tags
            var children = object.childNodes;
            for (j = 0; j < children.length; j++) {
            try {
                if (children[j] != null) {
                var theName = children[j].getAttribute('name');
                if (theName != null && theName.match(/flashvars/i)) {
                    new_object = new_object.replace(/<param\s+name\s*=\s*('|")flashvars('|")\s+value\s*=\s*('|")[^'"]*('|")\s*\/?\>/i, "<param name='flashvars' value='" + children[j].getAttribute('value') + "' />");
                }
                }
            }
            catch (err) {
            }
            }
            // replace the old embed object with the fixed versiony
            object.insertAdjacentHTML('beforeBegin', new_object);
            object.parentNode.removeChild(object);
        }
        }
    }
    
    $(window).bind('orientationchange', function(event) {
        if (window.orientation == 90 || window.orientation == -90 || window.orientation == 270) {
        $(window).resize();
        } else {
        $(window).resize();
        }
    }).trigger('orientationchange');
    
    function launch(url, name, width, height, options)
    {
    
        if (!name)
            {
            name = "window_" + Math.floor(1000 * Math.random());
            }
    
        if (!width)
            {
            width = screen.availWidth;
            }
    
        if (!height)
            {
            height = screen.availHeight;
            }
    
        if (!options)
            {
            options = "menubar=0,toolbar=0,location=0,directories=0,status=0,scrollbars=1,resizable=1";
            }
    
        width	= Math.min(width, screen.availWidth);
        height	= Math.min(height, screen.availHeight);
        var x	= Math.max(0, 0.5 * (screen.availWidth - width));
        var y	= Math.max(0, 0.5 * (screen.availHeight - height));
    
        var config = "";
        config += "left=" + x + ",top=" + y + ",";
        config += "screenX=" + x + ",screenY=" + y + ",";
        config += "width=" + width + ",height=" + height;
        config += "," + options;
    
        var win = window.open(url, name, config);
        if (win && window.focus)
            {
            win.focus();
            }
    }
        
    function sendTweet()
    {
        tweetUrl = "https://twitter.com/share?url=%20&text=Take%20a%20look%20inside%20%23DaftPunk&apos;s%20new%20album%20w/%20@creatorsproject.%20The%20Collaborators:%20Ep.%201%20ft.%20Giorgio%20Moroder:%20www.randomaccessmemories.com%20%23DaftPunkRAM";
        launch(tweetUrl, 'ramtweet', 500, 500);
    }
    
    function sendFB()
    {
        fbUrl ='https://www.facebook.com/sharer/sharer.php?u=http://www.randomaccessmemories.com';
        launch(fbUrl, 'ramtweet', 750, 300);
    }
    
    if(isiPad || isiPhone || isAndroid || isWindowsPhone || touch) {
        $('#instant-crush').replaceWith('<a href="https://smarturl.it/eem3bi" target="_blank"><img id="instant-crush" src="images/instant-crush-video-mobile.jpg" /></a>')
    }