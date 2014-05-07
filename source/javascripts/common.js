$(function(){

  var _oldWindowWidth = 1;

  window.onload = function(){

    var movie2 = $("#canvas1").moviedecoder({image:"/images/test.jpg", json:"/json/test.json",onmetadata:forceResize});
    var movie2 = $("#canvas2").moviedecoder({image:"/images/test2.jpg", json:"/json/test2.json",onmetadata:forceResize});
    var movie3 = $("#canvas3").moviedecoder({image:"/images/movie20140502183147.png", json:"/json/movie20140502183147.json",onmetadata:forceResize});
    //var movie3 = $("#canvas3").moviedecoder({image:"/images/test3.jpg", json:"/json/test3.json",onmetadata:forceResize});

    setMouseEvent($("#canvas1"), movie1);
    setMouseEvent($("#canvas2"), movie2);
    setMouseEvent($("#canvas3"), movie3);

    _oldWindowWidth = $(window).width();

  }

  var setMouseEvent = function(j,m) {
    j.on("click", function(){
      if(m.playing()==true) {
        m.pause();
      }else{
        m.play();
      }
    });
    j.on("mousemove", function(e){
      var mx = e.clientX / $(window).width();
      if(mx < 0){
        mx = 0;
      }else if(mx > 1){
        mx = 1;
      }
      m.currentTime(Math.round( m.duration()*mx) );
    });
  }

  var forceResize = function(){
    onresize(true);
  }
  var onresize = function(rot){
    console.log("onResize")
    if(_oldWindowWidth != $(window).width() || rot){
      var iframe;
      ///*
      if(parent!=undefined){
        $('iframe', parent.document).each(function() {
          if($(this).attr("src")==location.href){
            iframe = $(this);
          }
        });
        //alert("onresize/"+$(window).width()+"/"+parent.window.orientation);
        //console.log("onresize/"+$(window).width()+"/"+parent.window.orientation);
      }
      //*/
      //$("#canvas").css({"width":1+"px", "height":1+"px", "display": "none"});
      //$(".container").css({"width":1+"px", "height":1+"px"});
      var windowWidth = $(window).width();
      var windowHeight = $(window).height();

      $("canvas").each(function(){
        var tx = 0;
        var ty = 0;
        var ts = 1;
        ts = windowWidth / ($(this).attr("width"));
        if(ts < windowHeight / ($(this).attr("height"))) {
          ts = windowHeight / ($(this).attr("height"));
        }
        //ts = 1;
        $(".container").css({"width":windowWidth, "height":$(this).attr("height")*ts});
        //console.log(ts);
        //tx = Math.round((windowWidth - $(this).attr("width") * ts)*0.5);
        //ty = Math.round((windowHeight - $(this).attr("height") * ts)*0.5);
        $(this).css({"width":$(this).attr("width")+"px", "height":$(this).attr("height")+"px"});
        $(this).css({"scale":ts, "transformOrigin": '0px 0px'});
        //$("canvas").css({"x":tx, "y":ty, "scale":ts, "transformOrigin": '0px 0px', "display": "block"});
        //$("#canvas").css({"x":tx, "y":ty, "width":windowWidth, "height":windowHeight, "transformOrigin": '0px 0px'});

      });

    }
  }
  $(window).on("resize", function(){
    onresize(false);
  });
  if(parent!=undefined){
    parent.window.addEventListener("orientationchange", function(){
      onresize(true);
    });
  }else{
    window.addEventListener("orientationchange", function(){
      onresize();
    });
  }




});