;(function($) {

  var plugname = 'moviedecoder';

  var Class = function(elem, params){
      this.elem = elem;
      this.elem.data(plugname, this);
      this.params = params;

      var _this = this;

      this._stage;
      this._txtBitmaps = [];
      this._txtSSs = [];
      this._txtContainers = [];
      this._json = {};

      this._id = "canvas";
      this._duration = 0;
      this._nowPlay = true;

      this._nowTurn = 0;
      this._oldTurn = 0;
      this._nowTurnCount = 0;

      this._count = 0;
      this._oldDate = new Date();
      this._oldDateTime = this._oldDate.getTime();
      this._oldCount = -1;

      this._framerate = 30;

      this._ran = Math.random();

      this._imageData = [];

      this._bmp_wn = 0;
      this._bmp_hn = 0;

      this._loop = this.params.loop;

      function init() {
        _this._stage = new createjs.Stage(_this._id);
        $("#"+_this._id).css("background-color","transparent");

        for(var i=0;i<_this.params.image.length;i++){
          _this._imageData.push({id: "txt_"+i, src: _this.params.image[i]});
        }

        $.ajax({
          type: "GET",
          cache: false,
          url: _this.params.json,
          dataType: "json",
          success: function(data) {
            _this._json = data;
            jsonLoaded();
            _this.params.onmetadata();
          }
        });
      }

      function jsonLoaded() {
        $("#"+_this._id).attr("width", _this._json.params.width);
        $("#"+_this._id).attr("height", _this._json.params.height);
        _this._duration = _this._json.params.frameLength;
        _this._framerate = _this._json.params.framerate

        var queue = new createjs.LoadQueue();
        queue.on("complete", handleLoad, this);
        queue.loadManifest(_this._imageData, true);
      }

      function handleLoad(evt) {
        setupTxt(evt.target);

        _this._oldDate = new Date();
        _this._oldDateTime = _this._oldDate.getTime();

        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.on("tick", tick, this);
        _this.params.onload();
      }

      function tick(evt) {
        _this.rendering(false);
        _this._stage.update(evt);
      }
      this.rendering =  function(force) {
        if(_this._nowPlay || force){
          if(_this._count != _this._oldCount && _this._count < _this._json.frames.length && _this._txtContainers.length){
            //_stage.removeAllChildren();
            var n = (this._bmp_wn*this._bmp_hn);
            var txtContainer;
            var frame = _this._json.frames[_this._count];
            for(var i=0;i<frame.length;i++){
              var frame_set_num = Math.floor(frame[i] / n);
              var frame_num = frame[i] % n;
              for (var h=0;h<_this._txtContainers.length;h++){
                txtContainer = _this._txtContainers[h][i];
                if(h == frame_set_num){
                  txtContainer.visible = true;
                  txtContainer.gotoAndStop(frame_num);
                }else{
                  txtContainer.visible = false;
                }
              }
            }
          }

          if (_this._nowPlay){
            var nowDate = new Date();
            var nowDateTime = nowDate.getTime();
            var d = nowDateTime-_this._oldDateTime;
            var frameSeconds = Math.floor(1000/_this._framerate);
            if(d >= frameSeconds){
              var addFrame = Math.floor(d/frameSeconds);
              _this._oldCount = _this._count;
              _this._count+= addFrame;
              _this._oldDateTime = nowDateTime-(d%frameSeconds);
              //console.log(Math.floor(d/frameSeconds)+"/"+frameSeconds+"/");
            }else{
              //_this._oldDateTime = _this._oldDateTime-(d%frameSeconds);
            }

            if(_this._count>=_this._json.frames.length) {
              if(_this._loop == true){
                _this._count = 0;
              }else{
                console.log("end");
                _this._nowPlay = false;
                _this._count = 0;
              }

            }

            _this.params.ontimeupdate();
          }
        }
      }

      function setupTxt(queue) {
        var txtSS;

        for(var i=0; i<_this._imageData.length; i++) {
          var bmp;
          bmp = new createjs.Bitmap(queue.getResult("txt_"+i));
          _this._txtBitmaps.push(queue.getResult("txt_"+i));
          _this._txtSSs.push(new createjs.SpriteSheet({
            images: [_this._txtBitmaps[i]],
            frames: {
              width: _this._json.params.spriteSheet.width,
              height: _this._json.params.spriteSheet.height,
              regX: _this._json.params.spriteSheet.regX,
              regY: _this._json.params.spriteSheet.regY,
              numFrames: _this._json.params.spriteSheet.numFrames
            }
          }));
          _this._txtContainers[i] = []
          var txtContainer;
          if (i==0){
            _this._bmp_wn = bmp.image.width/_this._json.params.spriteSheet.width;
            _this._bmp_hn = bmp.image.height/_this._json.params.spriteSheet.height;
            //alert(_this._bmp_wn+"//////////////////////"+_this._bmp_hn);
          }
          for(var m=0;m<_this._json.params.width/_this._json.params.spriteSheet.width;m++) {
            for(var n=0;n<_this._json.params.height/_this._json.params.spriteSheet.height;n++) {
              txtContainer = new createjs.Sprite(_this._txtSSs[i], m*_this._json.params.wNum+n);
              txtContainer.setTransform(m*_this._json.params.spriteSheet.width, n*_this._json.params.spriteSheet.height);
              _this._txtContainers[i].push(txtContainer);
              _this._stage.addChild(txtContainer);
            }
          }
          /*
          for(m=0;m<_this._txtContainers[i].length;m++){
            _this._stage.addChild(_this._txtContainers[i][m]);
          }
          */
        }
      }



      this.elem.each(function(i){
        /* プラグイン内での現在の要素はthisで参照 */
        //$(this).text(this.tagName+"["+i+"]").css({"color":defaults.defColor,"padding":defaults.defPadding});
        if (i==0){
          _this._id = $(this).attr("id");
          init();
        }
      });


  }

  Class.prototype.pause = function(){
    this._nowPlay = false;
      return this;
  };
  Class.prototype.play = function() {
    this._nowPlay = true;
    var nowDate = new Date();
    this._oldDateTime = nowDate.getTime();
      return this;
  };
  Class.prototype.playing = function() {
      return this._nowPlay;
  };
  Class.prototype.loop = function(bool) {
    this._loop = bool;
    return this._count;
  };
  Class.prototype.currentTime = function(time) {
    if(typeof time=='undefined'){
    }else if(!isNaN(time)){
      time = Math.round(time);
      if(time < 0){
        time = 0;
      }else if(time >= this._duration && this._duration){
        time = this._duration-1;
      }
      this._count = time;
      this.rendering(true);
    }
    return this._count;
  };
  Class.prototype.duration = function() {
      return this._duration;
  };

  var defaultPrams = {
    json: 'hoge',
    image : [],
    loop: false,
    onmetadata: function(){},
    onload: function(){},
    ontimeupdate: function(){}
  };

  /**
   * 全プラグイン共通
   */
  $.fn[plugname] = function(options){
      return new Class(this, $.extend(defaultPrams, options, {}));
  }














/*
  $.fn.moviedecoder = function(options){

    var defaults = {
            json: 'hoge',
            image : 'fuga',
            onmetadata: function(){

            },
            onload: function(){

            }
    };

    var setting = $.extend(defaults,options);

    //プラグインの中身

    var stage;
    var txtBitmaps = [];
    var txtSSs = [];
    var txtContainers = [];
    var _json = {};

    var _id = "canvas";
    var _duration = 0;
    var _nowPlay = true;

    var _nowTurn = 0;
    var _oldTurn = 0;
    var _nowTurnCount = 0;

    var _count = 0;
    var _oldDate = new Date();
    var _oldDateTime = _oldDate.getTime();
    var _oldCount = -1;

    var _ran = Math.random();

    var imageData = [
      {id: "txt_0", src: setting.image}
    ];

    function init() {
      stage = new createjs.Stage(_id);
      $.ajax({
        type: "GET",
        cache: false,
        url: setting.json,
        dataType: "json",
        success: function(data) {
          _json = data;
          jsonLoaded();
          setting.onmetadata();
        }
      });
    }

    function jsonLoaded() {
      $("#"+_id).attr("width",_json.params.width);
      $("#"+_id).attr("height",_json.params.height);
      _duration = _json.frameLength;

      var queue = new createjs.LoadQueue();
      queue.on("complete", handleLoad, this);
      queue.loadManifest(imageData, true);
    }

    function handleLoad(evt) {
      setupTxt(evt.target);

      createjs.Ticker.timingMode = createjs.Ticker.RAF;
      createjs.Ticker.on("tick", tick, this);
      setting.onload();
    }

    function tick(evt) {

      if(_nowPlay){
        if(_count != _oldCount){
          //stage.removeAllChildren();
          txtContainer = txtContainers[_nowTurn][0];
          //stage.addChild(txtContainer);
          var frame = _json.frames[_count];
          for(var i=0;i<txtContainers[_nowTurn].length;i++){
            txtContainer = txtContainers[_nowTurn][i];
            txtContainer.gotoAndStop(frame.blocks[i]);
          }
        }


        var nowDate = new Date();
        var nowDateTime = nowDate.getTime();
        var d = nowDateTime-_oldDateTime;
        var frameSeconds = Math.floor(1000/_json.params.framerate);
        //console.log(d);
        if(d >= frameSeconds){
          _count+= Math.floor(d/frameSeconds);
          _oldDateTime = nowDateTime-(d%frameSeconds);
          //console.log(Math.floor(d/frameSeconds)+"/"+frameSeconds+"/");
        }else{
          _oldDateTime = _oldDateTime-(d%frameSeconds);
        }

        //_count++
        if(_count>=_json.frames.length) {
          _count = 0;
        }

        //_nowTurn = _nowTurn%(imageData.length-1);
        _oldTurn = _nowTurn;

        stage.update(evt);
      }
    }

    function setupTxt(queue) {
      //txtContainer = new createjs.Shape();
      var txtSS;

      for(var i=0; i<imageData.length; i++) {
        var bmp;
        bmp = new createjs.Bitmap(queue.getResult("txt_"+i));
        txtBitmaps.push(queue.getResult("txt_"+i));
        txtSSs.push(new createjs.SpriteSheet({
          images: [txtBitmaps[i]],
          //frames: { width: 100, height: 100, regX: 0, regY: 0, numFrames: 1}
          frames: {
            width: _json.params.spriteSheet.width,
            height: _json.params.spriteSheet.height,
            regX: _json.params.spriteSheet.regX,
            regY: _json.params.spriteSheet.regY,
            numFrames: _json.params.spriteSheet.numFrames
          }
        }));
        txtContainers[i] = []
        var txtContainer;
        for(var m=0;m<_json.params.wNum;m++) {
          for(var n=0;n<_json.params.hNum;n++) {
            txtContainer = new createjs.Sprite(txtSSs[i],m*_json.params.wNum+n);
            txtContainer.setTransform(m*_json.params.spriteSheet.width, n*_json.params.spriteSheet.height);
            txtContainers[i].push(txtContainer);
          }
        }
        //txtContainers.push(new createjs.Sprite(txtSSs[i],0));
      }
      for(var i=0;i<txtContainers[0].length;i++){
        stage.addChild(txtContainers[0][i]);
      }

    }

    //method
    var methods = {
      init : function( options ) {
        console.log(_ran);
        this.each(function(i){
          //$(this).text(this.tagName+"["+i+"]").css({"color":defaults.defColor,"padding":defaults.defPadding});
          if (i==0){
            _id = $(this).attr("id");
            init();
          }
        });
        return this;
      },
      destroy : function( ) {
        return this.each(function(){
        })
      },
      pause : function( ) {
        console.log(_ran);
        console.log(_nowPlay);
        _nowPlay = false;
        console.log(_nowPlay);
        console.log("p2");
        return this;
      },
      start : function( ) {
        console.log(_ran);
        _nowPlay = true;
        console.log("s2");
        return this;
      },
      playing : function( ) {
        return _nowPlay;
      },
      currentTime : function( time ) {
        if(typeof time=='undefined'){
          return _count;
        }else{
          _count = time;
          return _count;
        }
      },
      duration : function() {
        return _duration;
      }
    };


    //実行
    if ( methods[options] ) {
      return methods[options].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof options === 'object' || ! options ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  options + ' does not exist on jQuery.moviedecoder' );
    }



  };
  */

})(jQuery);