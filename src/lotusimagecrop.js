//							OM Ganesha
// Srikanth Bemineni
// 12/09/2017

(function($){
	$.fn.lotusImageCrop = function(options){

		function LotusImageCrop(element, options={})
		{
			_this = this
			this.element = element
			this.init = function(){
				this.handler = options;
				this.image = $(this.element).data('src')
				this.clip_width = $(this.element).data('clip-width')
				this.clip_height = $(this.element).data('clip-height')
				this.zoom = $(this.element).data('zoom')
				$(this.element).append('<div class="clip"><img id="clip-view" src="' + this.image + '"></div>')
				$(this.element).append('<img id="mask" ondragstart="return false;" src="' + this.image + '">')
				$("#mask", $(this.element)).on("load", function(){ setup.call(_this); addHandlers.call(_this); })
				$(window).resize(function(){ setup.call(_this);})
			}

			this.getX = function(){
				return Math.abs(this.clipLeft)
			}

			this.getY = function(){
				return Math.abs(this.clipTop)

			}

			this.cropWidth = function(){
				return this.clip_width;
			}

			this.cropHeight = function(){
				return this.clip_height;
			}

			this.getZoom = function()
			{
				return this.zoom;
			}

			this.increaseZoom = function(){
				if(this.zoom + 10 != 500)
				{
					this.zoom += 10;
					reposition.call(this);
				}

			}

			this.decreaseZoom = function(){
				//Make sure that the reduced zoom doesn't go past the clip width and height
				if(this.zoom - 10 != 0 && 
				   (((this.zoom - 10) * this.orig_imgwidth) / 100) > this.clip_width &&
				   (((this.zoom - 10) * this.orig_imgheight) / 100) > this.clip_height ) 
				{
					this.zoom -= 10;
					reposition.call(this);
				}
			}

			function setup()
			{
				_this = this;
				this.orig_imgwidth = $( "#mask", $(this.element)).width()
				this.orig_imgheight = $( "#mask", $(this.element)).height()

				//Set clip width
				$( ".clip", $(this.element)).css("width", this.clip_width + 'px')
				$( ".clip", $(this.element)).css("height", this.clip_height + 'px')
				console.log("width " + this.imgwidth + "height " + this.imgheight)

				this.container_width = $(this.element).width()
				this.container_height = $(this.element).height()
				this.clip_margin_sides = (this.container_width - this.clip_width)/2
				this.clip_margin_updown = (this.container_height - this.clip_height)/2

				$( ".clip", $(this.element)).css("margin-left", this.clip_margin_sides + 'px');
				$( ".clip", $(this.element)).css("margin-right", this.clip_margin_sides + 'px');
				$( ".clip", $(this.element)).css("margin-top", this.clip_margin_updown + 'px');
				$( ".clip", $(this.element)).css("margin-bottom", this.clip_margin_updown + 'px');

				reposition.call(this);
			}

			function reposition()
			{
				//Set image zoom width
				this.imgwidth = (this.zoom * this.orig_imgwidth) / 100
				this.imgheight = (this.zoom * this.orig_imgheight) / 100

				$("#mask", $(this.element)).css("width",this.imgwidth + 'px')
				$("#mask", $(this.element)).css("height",this.imgheight + 'px')

				$(".clip > #clip-view", $(this.element)).css("width", this.imgwidth + 'px')
				$(".clip > #clip-view", $(this.element)).css("height", this.imgheight + 'px')

				// image position
				// outside images
				this.maskleft = (this.container_width/2) - (this.imgwidth/2)
				this.maskTop = (this.container_height/2) - (this.imgheight/2)
				$("#mask", $(this.element)).css("left",this.maskleft + 'px')
				$("#mask", $(this.element)).css("top",this.maskTop + 'px')

				this.clipLeft = (this.clip_width/2) - (this.imgwidth/2)
				this.clipTop = (this.clip_height/2) - (this.imgheight/2)

				$(".clip > #clip-view", $(this.element)).css("left", this.clipLeft + 'px')
				$(".clip > #clip-view", $(this.element)).css("top", this.clipTop + 'px')

				_this.pageX = _this.pageY = 0;
				if(this.handler.hasOwnProperty('onchange'))
				{
						this.handler['onchange'](Math.abs(this.clipTop),
												 Math.abs(this.clipLeft),
												 this.zoom,
												 this.clip_width, 
												 this.clip_height)
				}
			}

			function addHandlers()
			{
				_this = this;
				// event handling
				$("#mask",$(this.element)).on('mousedown', function(e){
					$(this).on('mousemove',function(evt){
						trackMouse.call(_this,evt)
					})
				})

				$("#mask",$(this.element)).on('mouseup', function(e){
					$(this).off('mousemove')
					_this.pageX = _this.pageY = 0
				})
			}

			function trackMouse(event)
			{
				if( (!this.hasOwnProperty("pageX") || !this.hasOwnProperty("pageY")) ||
					(this.pageX == 0 && this.pageY == 0 ) )
				{
					this.pageX = event.pageX
					this.pageY = event.pageY
				}
				else
				{
					xdiff = this.pageX - event.pageX
					ydiff = this.pageY - event.pageY

					//Only move if clip values after the change are valid
					// do it individually for x anf y

					var changed = false;

					if(this.clipLeft - xdiff <= 0 && 
  					  (this.clipLeft - xdiff + negate(this.clip_width)) >= negate(this.imgwidth) )
					{
						this.maskleft = this.maskleft - xdiff	
						this.clipLeft = this.clipLeft - xdiff
						$("#mask", $(this.element)).css("left",this.maskleft + 'px')
						$(".clip > #clip-view", $(this.element)).css("left", this.clipLeft + 'px')
						this.pageX = event.pageX
						changed = true
					}

					if(this.clipTop - ydiff <= 0 &&
					  (this.clipTop - ydiff + negate(this.clip_height)) >= negate(this.imgheight))
					{
						this.maskTop = this.maskTop - ydiff
						this.clipTop = this.clipTop -  ydiff
						$("#mask", $(this.element)).css("top",this.maskTop + 'px')
						$(".clip > #clip-view", $(this.element)).css("top", this.clipTop + 'px')
						this.pageY = event.pageY
						changed = true
					}
					if (changed && this.handler.hasOwnProperty('onchange'))
					{
						this.handler['onchange'](Math.abs(this.clipTop),
												 Math.abs(this.clipLeft),
												 this.zoom,
												 this.clip_width, 
												 this.clip_height)
					}
				}
			}

			function negate(val)
			{
				if(val > 0){
					return val * -1;
				}
				else{
					return val;
				}
			}
			this.init()
		}

		var selectInstance;
		element = this[0];
        if(typeof options === 'string')
        {
             var args = Array.prototype.slice.call(arguments,1);
             
             selectInstance = $.data(element,"_lotusimagecrop");
             if(!selectInstance)
             {
                console.error("The select instance is not yet initialized");
                return;
             }
             else if(!$.isFunction(selectInstance[options]) || options.charAt(0) == '_')
             {
             	console.warn("No function by that name exits in this object");
                return;
             }
             return selectInstance[options].call(selectInstance,args);
         }
         else
         {
         	
            selectInstance = $.data(element, "_lotusimagecrop");
            if(!selectInstance)
            {
                selectInstance = new LotusImageCrop(this,options);
                $.data(element,"_lotusimagecrop",selectInstance);
            }
         	
         }
	}
})(jQuery)
