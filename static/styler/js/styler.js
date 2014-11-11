/*
 * Copyright 2014 Muhd Amirul Ashraf bin Mohd Fauzi <asdacap@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * Styler main function
 * Usage: 
 * var mystyle=Styler({
 * 		css:thecss,
 * 		container:thecontainer,
 * 		iframe:previewiframe,
 * 		basecss:thebasecss,
 * 		predeflayout:"",
 * 		searchlayout:true,
 * 		palettegallery:thepalettegallery,
 * 		palette:thepalette,
 * 		preparse:true
 * })
 * 
 * 'thecss' is the css that you want to edit.
 * 'thecontainer' is a jquery object which styler will use.
 * 'previewiframe' is a jquery object of an iframe which the content will be styled with the css
 * 'thebasecss' is a defaulr css that parse before 'thecss'. Used to predefine style in the control.
 * 'predeflayout' is the layout of the control. The layout of the control may also be put in the css if 'searchlayout' is true.
 * 'thepalettegallery' is a list of color palette use in color palette tab.
 * 'palette' is the initial palette
 * 'preparse' if true will call updateCSS. Beware that updateCss has some asyncronous stuff running. Careful not tu run updateCss if preparse is true.
 * to obtained updated css, symply call mystyle.getNewCss()
 * 
 */

/*! styler 2014-11-11 */
/* global window, jQuery, Styler:true, Image, document, console, setTimeout */

Styler = window.Styler || {};

Styler.ColorPicker = (function($){

    var ColorPicker = {};

    function RGBToHSL(r, g, b) {
        var
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        diff = max - min,
        h = 0, s = 0, l = (min + max) / 2;
        if (diff !== 0) {
            s = l < 0.5 ? diff / (max + min) : diff / (2 - max - min);

            h = (r == max ? (g - b) / diff : g == max ? 2 + (b - r) / diff : 4 + (r - g) / diff) * 60;
        }
        if(h<0){
            h=h+360;
        }
        return [h, s, l];
    }

    function HSLToRGB(h,s,l) {
        if (s === 0) {
            return [l, l, l];
        }

        var temp2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var temp1 = 2 * l - temp2;

        h /= 360;

        var
        rtemp = (h + 1 / 3) % 1,
        gtemp = h,
        btemp = (h + 2 / 3) % 1,
        rgb = [rtemp, gtemp, btemp],
        i = 0;

        for (; i < 3; ++i) {
            rgb[i] = rgb[i] < 1 / 6 ? temp1 + (temp2 - temp1) * 6 * rgb[i] : rgb[i] < 1 / 2 ? temp2 : rgb[i] < 2 / 3 ? temp1 + (temp2 - temp1) * 6 * (2 / 3 - rgb[i]) : temp1;
        }

        return rgb;
    }

    function roundNumber(num, dec) {
        var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
        return result;
    }

    function initColorChooser(options){

        options = options || {};
        var colorpickerstaticpath = options.static_path || '/';

        if( ColorPicker.initialized ){
            return;
        }
        ColorPicker.initialized = true;

        if(!$("#colorchooser").length){
            var containerdata="\x3Cdiv id=\'colorchooser\'\x3E\n        \x3Cdiv class=\'innercontainer\'\x3E\n        \x3Ccanvas class=\'colorcanvas\' width=\"200\" height=\"230\"\x3E\x3C\x2Fcanvas\x3E\n        \x3Cdiv class=\'sidebox\'\x3E\n            \x3Cdiv class=\'backboxtile\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'previewbox\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'comparebox\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'inputbox\'\x3E\n            \x3Cspan class=\'label\'\x3EHue:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'hue\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3ESaturation:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'saturation\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3ELightness:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'lightness\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3EAlpha:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'alpha\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3Cdiv class=\'palettebox\'\x3E\n            \x3Cdiv class=\'paletteicon\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'palettelist\'\x3E\n                \n            \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E";
            $("body").append(containerdata);
        }

        var maincontainer=$("#colorchooser");
        var maincanvas=maincontainer.find(".colorcanvas");
        var previewbox=maincontainer.find('.previewbox');
        var comparebox=maincontainer.find('.comparebox');
        var huecircle=new Image();
        huecircle.src=colorpickerstaticpath+'huecircle.png';
        var backtile=new Image();
        backtile.src=colorpickerstaticpath+'backtile.png';
        var alphatile=new Image();
        alphatile.src=colorpickerstaticpath+'alphatile.png';

        var huebuffer=document.createElement("canvas");
        huebuffer.width=100;
        huebuffer.height=100;

        var maininput=false;
        var topmargin=5;

        var currenthue=45;
        var saturation=100;
        var lightness=50;
        var opacity=1;

        var inputchanging=false;

        var inputid;
        var stylerobj;

        //0-#FFFFFF 1-#FFF 2-rgb(255,255,255) 3-rgba(255,255,255,1) 4-hsl(0,100%,100%) 5-hsla(0,100%,100%,1)
        var mode=0;

        function putBack(){
            var rgb=HSLToRGB(currenthue,saturation/100,lightness/100);
            var r=Math.floor(rgb[0]*255);
            var g=Math.floor(rgb[1]*255);
            var b=Math.floor(rgb[2]*255);
            function applyInput(text){
                maininput.val(text);
                maininput.css("background-color",text);
                inputchanging=true;
                if(inputid){

                }
                maininput.change();
                inputchanging=false;
            }
            if(opacity!=1){
                if(mode===0 || mode==1 || mode==2){
                    mode=3;
                }
                if(mode==4){
                    mode=5;
                }
            }else{
                if(mode==3){
                    mode=0;
                }
                if(mode==5){
                    mode=4;
                }
            }
            if(mode===0 || mode==1){
                r=r.toString(16);
                if(r.length==1){
                    r="0"+r;
                }
                g=g.toString(16);
                if(g.length==1){
                    g="0"+g;
                }
                b=b.toString(16);
                if(b.length==1){
                    b="0"+b;
                }
                var text="#"+r+g+b;
                applyInput(text);
                return;
            }
            if(mode==2){
                var text="rgb("+r+","+g+","+b+")";
                applyInput(text);
                return;
            }
            if(mode==3){
                var text="rgba("+r+","+g+","+b+","+opacity+")";
                applyInput(text);
                return;
            }
            if(mode==4){
                var text="hsl("+currenthue+","+saturation+"%,"+lightness+"%)";
                applyInput(text);
                return;
            }
            if(mode==5){
                var text="hsla("+currenthue+","+saturation+"%,"+lightness+"%,"+opacity+")";
                applyInput(text);
                return;
            }
        }

        function fromRGBA(r,g,b,a){
            var hsl=RGBToHSL(r/255,g/255,b/255);
            currenthue=hsl[0];
            saturation=hsl[1]*100;
            lightness=hsl[2]*100;
            opacity=a;
            updateHueData();
            updateInput();
        }

        function fromHash(r,g,b){
            return fromRGBA(parseInt(r,16),parseInt(g,16),parseInt(b,16),1);
        }

        function fromHSLA(h,s,l,a){
            currenthue=h;
            saturation=s;
            lightness=l;
            opacity=a;
            updateHueData();
            updateInput();
        }

        function mainInputChange(){
            if(inputchanging){
                return;
            }
            parseValue(maininput.val());
        }

        function parseValue(text){
            if(/^\s*$/.test(text)){
                mode=0;
                return;
            }
            var tester=/^\s*#([0-o9a-fA-F]{6})\s*$/;
            var match=tester.exec(text);
            if(match){
                mode=0;
                fromHash(match[1].slice(0,2),match[1].slice(2,4),match[1].slice(4,6));
                return;
            }
            tester=/^\s*#([0-o9a-fA-F]{3})\s*$/;
            match=undefined;
            match=tester.exec(text);
            if(match){
                mode=1;
                fromHash(match[1].slice(0,1),match[1].slice(1,2),match[1].slice(2,3));
                return;
            }
            tester=/^\s*rgb\((\d+),(\d+),(\d+)\)\s*$/;
            match=undefined;
            match=tester.exec(text);
            if(match){
                mode=2;
                fromRGBA(match[1],match[2],match[3],1);
                return;
            }
            tester=/^\s*rgba\((\d+),(\d+),(\d+),([\d\.]+)\)\s*$/;
            match=undefined;
            match=tester.exec(text);
            if(match){
                mode=3;
                fromRGBA(match[1],match[2],match[3],match[4]);
                return;
            }
            tester=/^\s*hsl\((\d+),(\d+)%?,(\d+)%?\)\s*$/;
            match=undefined;
            match=tester.exec(text);
            if(match){
                mode=4;
                fromHSLA(match[1],match[2],match[3],1);
                return;
            }
            tester=/^\s*hsla\((\d+),(\d+)%?,(\d+)%?,([\d\.]+)\)\s*$/;
            match=undefined;
            match=tester.exec(text);
            if(match){
                mode=5;
                fromHSLA(match[1],match[2],match[3],match[4]);
                return;
            }
            console.warn("WARNING unknown color value.->"+text);
            mode=0;
        }

        function updateHueData(){
            var ctx=huebuffer.getContext('2d');
            ctx.fillStyle='white';
            ctx.fillRect(0,0,100,100);
            var imgdata=ctx.getImageData(0,0,100,100);
            var data=imgdata.data;
            for(var y = 0; y < 100; y++) {
                for(var x = 0; x < 100; x++) {
                    var rgb=HSLToRGB(currenthue,x/100,(100-y)/100);
                    rgb[0]*=255;
                    rgb[1]*=255;
                    rgb[2]*=255;
                    data[((100 * y) + x) * 4]=rgb[0];
                    data[((100 * y) + x) * 4 + 1]=rgb[1];
                    data[((100 * y) + x) * 4 + 2]=rgb[2];
                    data[((100 * y) + x) * 4 + 3]=255;
                }
            }
            ctx.putImageData(imgdata,0,0);
        }
        updateHueData();

        function updateInput(){
            maincontainer.find("input[name=hue]").val(currenthue);
            maincontainer.find("input[name=saturation]").val(saturation);
            maincontainer.find("input[name=lightness]").val(lightness);
            maincontainer.find("input[name=alpha]").val(opacity);
            putBack();
        }

        function inputChange(){
            if(/[\d\.]+/.test(maincontainer.find("input[name=hue]").val())){
                var val=parseInt(maincontainer.find("input[name=hue]").val(),0);
                if(val>0 && val <360){
                    currenthue=val;
                    updateHueData();
                }
            }
            if(/[\d\.]+/.test(maincontainer.find("input[name=saturation]").val())){
                var val=parseInt(maincontainer.find("input[name=saturation]").val(),0);
                if(val>0 && val <100)
                    saturation=val;
            }
            if(/[\d\.]+/.test(maincontainer.find("input[name=lightness]").val())){
                var val=parseInt(maincontainer.find("input[name=lightness]").val(),0);
                if(val>0 && val <100)
                    lightness=val;
            }
            if(/[\d\.]+/.test(maincontainer.find("input[name=alpha]").val())){
                var val=parseFloat(maincontainer.find("input[name=alpha]").val());
                if(val>0 && val <1)
                    opacity=val;
            }
        }
        maincontainer.find(".inputbox input").change(inputChange);

        function draw(){

            previewbox.css('background-color','hsla('+currenthue+','+saturation+'%,'+lightness+'%,'+opacity+')');

            var ctx=maincanvas.get(0).getContext("2d");
            ctx.save();

            ctx.fillStyle='#777';
            ctx.fillRect(0,0,200,200);

            ctx.drawImage(huecircle,5,5,190,190);
            ctx.drawImage(backtile,50,50,100,100);
            ctx.globalAlpha=opacity;
            ctx.drawImage(huebuffer,50,50,100,100);
            ctx.globalAlpha=1;

            ctx.save();
            ctx.translate(100,100);
            ctx.rotate(currenthue*Math.PI/180);
            ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(0,-95);
            ctx.lineTo(0,-77);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            var they=100-lightness;
            var thex=saturation;
            ctx.beginPath();
            ctx.arc(50+thex,50+they,3,0,Math.PI*2);
            ctx.lineWidth=1;
            ctx.stroke();
            ctx.closePath();

            ctx.drawImage(alphatile,5,205);
            var gradient=ctx.createLinearGradient(5,0,195,0);
            gradient.addColorStop(0,'hsla('+currenthue+','+saturation+'%,'+lightness+'%,0)');
            gradient.addColorStop(1,'hsla('+currenthue+','+saturation+'%,'+lightness+'%,1)');
            ctx.fillStyle=gradient;
            ctx.fillRect(5,205,190,20);

            ctx.beginPath();
            ctx.moveTo(5+opacity*190,205);
            ctx.lineTo(5+opacity*190,225);
            ctx.lineWidth=2;
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }

        function drawloop(){
            draw();
            setTimeout(drawloop,100);
        }
        drawloop();

        maincanvas.bind('mousedown',function(e){

            function removeCPLink(){
                if(inputid && stylerobj){
                    stylerobj.setInputColor(inputid,"");
                }
            }

            var offset=maincanvas.offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;

            var mx=x-100;
            var my=y-100;
            //check if in hue circle

            function hueModify(y,x){
                var rad=Math.atan2(y,x);
                rad=rad*180/Math.PI;
                rad=rad+90;
                if(rad<0){
                    rad=rad+360;
                }
                currenthue=Math.floor(rad);
                updateHueData();
                draw();
                updateInput();
                removeCPLink();
            }

            var radius=Math.sqrt(mx*mx+my*my);
            if(radius<95 && radius >77){
                hueModify(my,mx);

                maincanvas.bind('mousemove',function(e){
                    var offset=maincanvas.offset();
                    var x = e.pageX - offset.left;
                    var y = e.pageY - offset.top;

                    var mx=x-100;
                    var my=y-100;
                    hueModify(my,mx);
                });

                var unbind = function(){
                    maincanvas.unbind('mouseup'); 
                    maincanvas.unbind('mouseout'); 
                    maincanvas.unbind('mousemove'); 
                };

                maincanvas.bind('mouseup',unbind);
                maincanvas.bind('mouseout',unbind);

                return false;
            }

            if(x>50 && x<150 && y>50 && y<150){

                var modify = function(x,y){
                    saturation=x;
                    lightness=100-y;
                    draw();
                    updateInput();
                    removeCPLink();
                };

                modify(x-50,y-50);


                maincanvas.bind('mousemove',function(e){
                    var offset=maincanvas.offset();
                    var x = e.pageX - offset.left;
                    var y = e.pageY - offset.top;

                    var thex=x-50;
                    if(thex<0){
                        thex=0;
                    }
                    if(thex>100){
                        thex=100;
                    }
                    var they=y-50;
                    if(they<0){
                        they=0;
                    }
                    if(they>100){
                        they=100;
                    }
                    modify(thex,they);
                    return false;
                });

                var unbind=function(){
                    maincanvas.unbind('mouseup'); 
                    maincanvas.unbind('mouseout'); 
                    maincanvas.unbind('mousemove'); 
                };

                maincanvas.bind('mouseup',unbind);
                maincanvas.bind('mouseout',unbind);

                return false;
            }

            if(x>5 && x<195 && y>205 && y<225){

                var modifyo = function(x){
                    opacity=x/190;
                    opacity=roundNumber(opacity,3);
                    updateInput();
                    removeCPLink();
                };

                modifyo(x-5,y-205);

                maincanvas.bind('mousemove',function(e){
                    var offset=maincanvas.offset();
                    var x = e.pageX - offset.left;
                    //var y = e.pageY - offset.top; // Never used
                    var thex=x-5;
                    //var they=y-205; // Never used
                    if(thex<0){
                        thex=0;
                    }
                    if(thex>190){
                        thex=190;
                    }
                    modifyo(thex);
                    return false;
                });

                var unbind = function(){
                    maincanvas.unbind('mouseup'); 
                    maincanvas.unbind('mouseout'); 
                    maincanvas.unbind('mousemove'); 
                };

                maincanvas.bind('mouseup',unbind);
                maincanvas.bind('mouseout',unbind);

                return false;
            }

        });

        draw();

        maincontainer.click(function(){
            return false;
        });

        function hide(){
            maincontainer.slideUp(removePalette());
            $(document).unbind("click",hide);
            if(maininput){
                maininput.unbind("change",mainInputChange);
                maininput=false;
            }
            inputid=undefined;
            stylerobj=undefined;
        }

        var paletteboxshown=false;
        function showPalettebox(){
            paletteboxshown=true;
            maincontainer.find(".innercontainer").animate({left:-200},500);
        }

        function hidePalettebox(){
            paletteboxshown=false;
            maincontainer.find(".innercontainer").animate({left:0},500);
        }

        maincontainer.find(".paletteicon").click(function(){
            if(paletteboxshown){
                hidePalettebox();
            }else{
                showPalettebox();
            }
        });

        function removePalette(){
            maincontainer.width(285);
            maincontainer.find(".palettelist").empty();
            hidePalettebox();
        }

        function fetchPalette(){
            maincontainer.width(310);
            var palettecolors=stylerobj.getPalette();
            var currentcolor=stylerobj.getCurrentColorName(inputid);
            var palettename;
            for(palettename in palettecolors){
                var palettecontainer=$("<div class='paletteitem'>");
                var previewbox=$("<div class='paletteitembox'>");
                previewbox.attr("title",palettename);
                if(palettename==currentcolor){
                    palettecontainer.toggleClass("selected");
                }
                previewbox.css("background-color",palettecolors[palettename]);
                palettecontainer.append(previewbox);
                palettecontainer.append("<span class='colorname'>"+palettename+"<span>");
                palettecontainer.append("<br />");
                palettecontainer.click(function(){
                    var thecolorname=$(this).find(".colorname").text();
                    stylerobj.setInputColor(inputid,thecolorname);
                    var thepallete=stylerobj.getPalette();
                    parseValue(thepallete[thecolorname]);
                    maincontainer.find(".palettelist .selected").toggleClass("selected");
                    $(this).toggleClass("selected");
                });
                maincontainer.find(".palettelist").append(palettecontainer);
            }
        }

        ColorPicker.show = function(input,inputidp,stylerobjp){
            function initit(){

                if(inputidp!==undefined){
                    inputid=inputidp;
                    stylerobj=stylerobjp;
                    fetchPalette();
                }

                var offset=input.offset();
                var offx=offset.left;
                var offy=offset.top+input.outerHeight()+topmargin;

                offx=offx-maincontainer.outerWidth()/2+input.outerWidth()/2;

                if(offx+maincontainer.outerWidth()>$(window).width()){
                    offx=$(window).width()-maincontainer.outerWidth();
                }
                if(offx<0){
                    offx=0;
                }
                if(offy+maincontainer.outerHeight()>$(window).height()){
                    offy=offset.top-maincontainer.outerHeight();
                }
                if(offy<0){
                    offy=0;
                }

                maincontainer.css("left",offx);
                maincontainer.css("top",offy);
                maininput=input;
                maincontainer.slideDown();
                $(document).click(hide);
                maininput.bind('change',mainInputChange);
                comparebox.css("background-color",maininput.val());
                parseValue(maininput.val());
            }

            if(maininput && maininput[0]==input[0]){
                return;
            }
            if(maininput && maininput!=input){
                maincontainer.slideUp(initit);
                return;
            }
            initit();
        };

    }

    ColorPicker.initialize = initColorChooser;

    return ColorPicker;

})(jQuery);


/*! jQuery UI - v1.11.2 - 2014-11-04
* http://jqueryui.com
* Includes: widget.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
/*!
 * jQuery UI Widget 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */


var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

var widget = $.widget;



}));
/* global window, jQuery, Styler:true, console, setTimeout */

Styler = window.Styler || {};

Styler.initialize = (function($){
    var initializer = function(args){

        var Styler = this;

        var defargs={
            css:"",
            iframe:$("<iframe>"),
            basecss:"",
            container:$("<div>"),
            predeflayout:{},
            searchlayout:true,
            palettegallery:[
                {
                    name:"default",
                    colors:{
                        foreground:"#000",
                        foreground2:"#011969",
                        background:"#ADE7FF",
                        background2:"#B1D1DE",
                        border:"#0C506B",
                        highlight:"#FF110D"
                    }
                },
                {
                    name:"purple",
                    colors:{
                        foreground:"#000",
                        foreground2:"#870047",
                        background:"#E768AB",
                        background2:"#E73A95",
                        border:"#9c2765",
                        highlight:"#98ed00"
                    }
                }
            ],
            palette:{
                foreground:"#000",
                foreground2:"#011969",
                background:"#ADE7FF",
                background2:"#B1D1DE",
                border:"#0C506B",
                highlight:"#FF110D"
            },
            preparse:true
        };

        var parsearg=$.extend({},defargs,args);

        // css parsing and dom manipulation

        var mainbody = parsearg.container;
        var cssbase = parsearg.basecss;
        var oldstyle = parsearg.css;
        var selectorDict = [];
        var previewiframe = parsearg.iframe;
        var thehandlers = {};
        var changelog = {};
        var inactive = false;
        var stylerobj={};
        var predeflayout=parsearg.predeflayout;
        var searchlayout=parsearg.searchlayout;

        function modifycss(selector, css, csstring, noview) {
            if (inactive && !noview) {
                return;
            }
            console.log("change " + css + " for " + selector + "->" + csstring);
            if (selector === '') {
                return;
            }
            if (selector !== "" && !noview) {
                previewiframe.contents().find(selector).css(css, csstring);
                if (!changelog[selector]) {
                    changelog[selector] = {};
                }
                if (csstring === "" || csstring === {}) {
                    changelog[selector][css] = 'delete';
                } else {
                    changelog[selector][css] = csstring;
                }
            }
        }
        stylerobj.modifycss=modifycss;

        function applytocontrol(selector, css, csstring) {
            thehandlers[selector][css](csstring);
        }
        stylerobj.applytocontrol = applytocontrol;

        function registercsshandler(selector, css, thefunction) {
            if (!thehandlers[selector]) {
                thehandlers[selector] = {};
            }
            if (thehandlers[selector][css]) {
                console.warn("for some reason, this handler already exist->" + selector +
                " css->" + css);
            }
            thehandlers[selector][css] = thefunction;
        }
        stylerobj.registercsshandler=registercsshandler;

        function ishandlerexist(selector, css) {
            if (thehandlers[selector]) {
                if (thehandlers[selector][css]) {
                    return true;
                }
            }
            return false;
        }

        function reverse_css() {
            for ( var selector in changelog) {
                var properties = changelog[selector];
                for ( var property in properties) {
                    if (properties.hasOwnProperty(property)) {
                        $(previewiframe).contents().find(selector).css(property, "");
                    }
                }
            }
        }

        function getnewcss() {

            var preappend = "/*--CSS statement below is generated by Styler. Please do not remove this comment--*/";
            var newgenerated = "\n"+preappend + "\n";
            var endappend = "\n/*--CSS statement above is generated by Styler. Please do not remove this comment--*/";
            var newstyle = oldstyle;
            // new generetor.....................
            previewiframe.contents().find(".preview_container").toggleClass(
            "preview_container");
            var extractegenerated = /\/\*--CSS statement below is generated by Styler. Please do not remove this comment--\*\/([\s\S]*)/;
            var oldgenerated = extractegenerated.exec(oldstyle);

            if (oldgenerated) {
                var oldvalue = oldgenerated[0];

                var endtag = /([\s\S]*)\n\/\*--CSS statement above is generated by Styler. Please do not remove this comment--\*\//;
                    var endtagavailable = endtag.exec(oldgenerated[1]);
                if (endtagavailable) {
                    oldvalue = endtag.exec(oldgenerated[0])[0];
                    oldgenerated = endtagavailable;
                }

                var generatedportion = oldgenerated[1];
                for ( var selector in changelog) {
                    var csspropertygroupextractor = new RegExp(selector + "[ ]*{[^{}]*}");
                    var selectorgroup = csspropertygroupextractor
                    .exec(generatedportion);
                    if (selectorgroup) {
                        var oldgroup = selectorgroup[0];
                        var closednewgroup = selectorgroup[0];
                        var newgroup = /([^}]*)}/.exec(closednewgroup)[1];

                        var properties = changelog[selector];
                        for ( var property in properties) {
                            if (properties.hasOwnProperty(property)) {
                                var propertytext = property + ":" + properties[property] + ";";
                                // find current property in current group.
                                // if exist replace with new one
                                // if not create it and append.
                                var theregex = new RegExp("([\\s;]+)" + property + " *:[^:;]*;");
                                if (theregex.test(newgroup)) {
                                    var prefix = theregex.exec(newgroup)[1];
                                    newgroup = newgroup.replace(theregex, prefix + propertytext);
                                } else {
                                    newgroup = newgroup + propertytext + "\n";
                                }
                            }
                        }

                        newgroup = newgroup + "}";

                        generatedportion = generatedportion.replace(oldgroup, newgroup);

                    } else {
                        var newgroup = "\n" + selector + "{\n";
                            var properties = changelog[selector];
                            for ( var property in properties) {
                                if (properties.hasOwnProperty(property)) {
                                    var propertytext = property + ":" + properties[property] + ";\n";
                                    newgroup = newgroup + propertytext;
                                }
                            }
                            newgroup = newgroup + "}";
                            generatedportion = generatedportion + newgroup;
                            // make new css group and put in the generated
                    }

                }

                newstyle = newstyle.replace(oldvalue, preappend + generatedportion + endappend);

            } else {
                for ( var selector in changelog) {
                    var newgroup = "\n" + selector + "{\n";
                        var properties = changelog[selector];
                        for ( var property in properties) {
                            if (properties.hasOwnProperty(property)) {
                                var propertytext = property + ":" + properties[property] + ";\n";
                                newgroup = newgroup + propertytext;
                            }
                        }
                        newgroup = newgroup + "}";
                        newgenerated = newgenerated + newgroup;
                        // make new css group and put in the generated
                }
                newstyle = newstyle + newgenerated + endappend;

            }

            return newstyle;
        }


        $('#savebutton').click(function() {
            savestyle();
        });

        function extract_properties() {
            var ichangeinactive=true;
            if(inactive)ichangeinactive=false;
            inactive = true;
            // first exclude the comment.
            var commentfinder = /\/\*[\s\S]*?\*\//mg;
                var nocomment = cssbase + oldstyle.replace(commentfinder, "\n");
            // then find it
            var propertyextracter = new RegExp("\\s*([^}]+?)\\s*{([^{}]*)}", 'mg');
            var match;
            while (match = propertyextracter.exec(nocomment)) {
                var selector = $.trim(match[1]);
                var properties = match[2];
                var propertyextracter2g = /([^:;]+):([^:;]*|[^:;]*\([^;]*\))[^:;]*\;/g;
                var propmatch;
                while (propmatch = propertyextracter2g.exec(properties)) {
                    var css = $.trim(propmatch[1]);
                    var value = $.trim(propmatch[2]);
                    if (ishandlerexist(selector, css)) {
                        applytocontrol(selector, css, value);
                    }
                }

            }
            if(ichangeinactive)
                inactive = false;
        }

        var accordioncounter = 0;
        function buildcontrol(property, defaultprop) {

            if(property.type !== undefined){
                if(property.type != "control"){
                    return buildgroup(property,defaultprop);
                }
            }

            if (defaultprop) {
                property = $.extend({}, defaultprop, property);
            }
            if (!property.selector | !property.css) {
                console.error("Minimum control component is not given.");
                return;
            }
            property.name = property.name || property.css;

            //var selector = property.selector;
            var name = property.name;
            var css = property.css;

            //Enclose in group
            if(property.container){
                var tempcont={
                    type:property.container,
                    name:name,
                    controls:[property]
                };
                property.container=undefined;
                return buildgroup(tempcont,defaultprop);
            }

            var thecontainer = $("<div class='styler_control'>");
            var thebuilder;
            var buildername;
            if (property.builder) { // A builder is specified
                buildername = property.builder;
                thebuilder = Styler.Meta.builders[property.builder];
            } else if (Styler.Meta.predefbuilders[property.css]) { // A builder for the css exist.
                thebuilder = Styler.Meta.predefbuilders[property.css];
                buildername = "Predefined builder: "+property.css;
            } else if (Styler.Meta.predefcustomcss[property.css]) { // The css is listed in a predefined layout. Likely not a css, just a shortcut.
                buildername = "predef";
                thebuilder = undefined;
            } else { // Fallback to text input
                buildername = "defaultbuilder";
                thebuilder = Styler.Meta.builders["default"];
            }

            //If css not listed in nolabel list.
            if(Styler.Meta.nolabel.indexOf(css)==-1){
                thecontainer.append("<label>"+name+" : </label>");
                if(Styler.Meta.nobr.indexOf(buildername)==-1){ //if builder not listed in nobr
                    thecontainer.append("<br />");
                }else{
                }
            }
            if (thebuilder) {
                //try{
                    thecontainer.append(thebuilder(stylerobj,property));
                //}catch(e){
                 //   console.error("Error on builder "+buildername+" ->"+e);
                //}

            } else {
                // when predefbuilder
                var newproperties=$.extend(true,{},Styler.Meta.predefcustomcss[property.css]);
                newproperties.name=property.name;
                property.name=undefined;
                thecontainer.append(buildcontrol(newproperties, property));
            }
            return thecontainer;
        }

        //Build contrors using property which is a group object from the layout json
        function buildgroup(property, defaultprop) {
            var innerdefprop = $.extend({}, defaultprop, property.defaultprop);
            var controls = property.controls;
            var group=$("<div>");

            if( property.type === undefined ){
                property.type = "emptygroup";
            }

            if (property.type == "bordergroup" ) {
                group = $("<div class='panel panel-default styler-group'>");
                if (property.name) {
                    group.append("<div class='panel-heading'><div class='panel-title'>" + property.name + "</div></div>");
                }
                for ( var index in controls) {
                    var body = $("<div class='panel-body'>");
                    body.append(buildcontrol(controls[index], innerdefprop));
                    group.append(body);
                }
                return group;
            } else if (property.type == "emptygroup" || property.type == "group"){
                group = $("<div>");
                if (property.name) {
                    group.append("<h4>" + property.name + "</h4>");
                }
                for ( var index in controls) {
                    group.append(buildcontrol(controls[index], innerdefprop));
                }
                return group;
            } else if (property.type == "accordion") {
                accordioncounter = accordioncounter + 1;
                var group = $("<div class='panel panel-default styler-group'>");

                var controls = property.controls;

                var name = property.name || "no-title";
                var header = $("<div class='panel-heading'><h4 class='panel-title'><a data-toggle='collapse' href='#accordion-"+accordioncounter+"'>" + name + "</a></h4></div>");

                var content = $("<div id='accordion-"+accordioncounter+"' class='panel-collapse collapse'></div>");
                var incontent = $("<div class='panel-body'>");

                for ( var index in controls) {
                    incontent.append(buildcontrol(controls[index], innerdefprop));
                }

                content.append(incontent);
                group.append(header);
                group.append(content);
                return group;
            }
        }

        //Generate the main tab
        function buildlayout() {
            var tempdiv = $("<div>");
            var tabmenu = $("<ul>");
            tabmenu.addClass('nav');
            tabmenu.addClass('nav-tabs');
            tabmenu.attr('role','tablist');
            var tabcontent = $('<div class="tab-content">');

            var executed=false;
            var uid=0;

            //Process the layout json given either predefined or in CSS.
            function process_layout(layout){
                executed=true;
                for (var page in layout) {
                    //Add tabs
                    uid+=1;
                    var newid = "tab-" + page.replace(/\s/g, "_");
                    newid=newid+"uid"+uid.toString();
                    var thediv = $("<div id='" + newid + "' class='tab-pane'></div>");
                    var properties = layout[page];
                    var tab = $("<li><a href='#" + newid + "' data-toggle='tab'>" + page + "</a></li>");
                    tabmenu.append(tab);
                    //build the control
                    thediv.append(buildgroup(properties));
                    tabcontent.append(thediv);
                }
            }

            if(predeflayout){
                process_layout(predeflayout);
            }
            if(searchlayout){
                var layoutfinder = /\/\*\s*layout\s*\n([^*]*)\n\s*\*\//mg;
                    var matches;
                while(matches = layoutfinder.exec(oldstyle)){
                    var thelayout=matches[1];
                    var layout;
                    try {
                        layout = JSON.parse(thelayout);
                    } catch (e) {
                        console.error("Invalid layout->" + e.toString());
                        continue;
                    }
                    process_layout(layout);
                }
            }
            if(!executed){
                tabmenu.append("<li><a href='#taberror'>Error</a></li>");
                tempdiv.append("<div id='taberror'><h3>No valid styler layout found.</h3>The css does not contain Styler layout description. Therefore styler is not available.</div>");
            }

            //-------------------color--------------------------------
            tabmenu.prepend("<li><a href='#stylercolortab' class='stylercolortab' data-toggle='tab'>Color</a></li>");
            var colortab=$("<div id='stylercolortab' class='tab-pane active'>");
            colortab.append(palettediv);
            tabcontent.append(colortab);

            mainbody.empty();

            var panel = $("<div class='panel panel-default'>");
            var panel_body = $("<div class='panel-body'>");
            panel_body.append(tabmenu);
            panel_body.append(tabcontent);
            panel.append(panel_body);
            tempdiv.append(panel);

            mainbody.append(tempdiv);
            
            // By default open color tab first.
            tempdiv.find('a.stylercolortab').tab('show');
        }

        function reset_all() {
            for ( var selector in thehandlers) {
                for ( var css in thehandlers[selector]) {
                    for ( var defcss in Styler.Meta.defaultvalues) {
                        if (css == defcss) {
                            thehandlers[selector][css](Styler.Meta.defaultvalues[defcss]);
                        }
                    }
                }
            }
        }

        function reset_state(){
            oldstyle="";
            selectorDict=[];
            thehandlers={};
            changelog={};
            colorinputs={};
            palette=$.extend(true,{},parsearg.palette);
            palettegallery=parsearg.palettegallery;
            mainbody.empty();
        }

        var asyncstuff = function() {
            buildlayout();
            reset_all();
            extract_properties();
            extractColorPalette();
            initializeColorPalette();
            inactive = false;
        };

        function savestyle(revert) {
            var newstyle=getnewcss();
            newstyle=putColorPaletteData(newstyle);
            oldstyle = newstyle;
            if(revert){
                reverse_css();
            }
            return oldstyle;
        }

        function updateCss(css){
            reset_state();
            oldstyle = css;
            inactive = true;
            mainbody.html("<div class='mainloading'><br /><br /><br /><br /><h3>Parsing</h3>Please wait...</div>");
            setTimeout(asyncstuff, 100);
        }

        stylerobj.getNewCss=savestyle;
        stylerobj.updateCss=updateCss;


        //-----------color palette system-----------------

        //A dictionary of input id and {input:input,color:color}
        var colorinputs={};

        //A dictionary of colorname and value
        var palette=$.extend(true,{},parsearg.palette);

        var palettegallery=parsearg.palettegallery;
        var palettediv=$("<div class='palettetab'>");

        function initializeColorPalette(){
            palettediv.empty();
            var moddiv=$("<div>");
            moddiv.append("<h3>Modify Color Palette</h3>");
            var palettelist=$("<div class='palettelist'>");
            moddiv.append(palettelist);
            palettediv.append(moddiv);
            repopulatePaletteList();

            var addcolordiv=$("<div class='addcolor'><span style='font-weight:bold;'>Add Color</span></div>");
            addcolordiv.append("<div style='margin:1ex 0;'>Color name : <input name='colorname' /></div>");
            addcolordiv.append("<button>Add</button>");
            addcolordiv.find("button").button();
            addcolordiv.find("button").click(function(){
                var colorname=$(addcolordiv).find("input[name=colorname]").val();
                if(colorname===undefined || colorname.trim()==="")return;
                changePaletteColor(colorname,"#ffffff");
                repopulatePaletteList();
            });
            palettediv.append(addcolordiv);

            palettediv.append("<h3>Select predefined Color Palette</h3>");
            palettediv.append("<div class='palettegallery'>");
            repopulatePaletteGallery();

            var addgaldiv=$("<div class='addcolorgallery'><span style='font-weight:bold;'>Add Color Palette</span></div>");
            addgaldiv.append("<div>Theme Name: <input name='themename'/></div>");
            addgaldiv.append("<button>Add</button>");
            addgaldiv.find("button").button();
            addgaldiv.find("button").click(function(){
                var thename=$(addgaldiv).find("input[name=themename]").val();
                if(thename===undefined || thename.trim()==="")return;
                for(var i in palettegallery){
                    if(palettegallery[i].name==thename)return;
                }
                var newpalette={name:thename,colors:{}};
                for(var color in palette){
                    newpalette.colors[color]=palette[color];
                }
                palettegallery.push(newpalette);
                repopulatePaletteGallery();
            });

            palettediv.append(addgaldiv);

        }

        function repopulatePaletteGallery(){
            var galdiv=palettediv.find(".palettegallery");
            galdiv.empty();
            for(var index in palettegallery){
                var itemdiv=$("<div themename='"+palettegallery[index].name+"' class='palettethemeitem'>");
                var removegal=$("<div class='removecolor'>");
                removegal.click(function(){
                    var themename=$(this).parent().attr("themename");
                    var tindex=0;
                    while(tindex<palettegallery.length){
                        if(palettegallery[tindex].name==themename){
                            break;
                        }
                        tindex++;
                    }
                    if(tindex==palettegallery.length){
                        console.error("cannot find theme "+themename);
                    }else{
                        palettegallery.splice(tindex,1);
                    }
                    repopulatePaletteGallery();
                });
                itemdiv.append(removegal);
                for(var colorname in palettegallery[index].colors){
                    itemdiv.append("<div class='colorbox' style='background-color:"+palettegallery[index].colors[colorname]+"'></div>");
                }
                itemdiv.append("<span class='name'>"+palettegallery[index].name+"</span>");
                itemdiv.click(function(){
                    changePaletteTheme($(this).attr("themename"));
                });
                galdiv.append(itemdiv);
            }
        }

        function repopulatePaletteList(){
            var palettelist=palettediv.find(".palettelist");
            palettelist.empty();
            for(var colorname in palette){
                var citem=$("<div class='palettecoloritem'></div>");
                var input=$("<input class='colorinput'>");
                input.css("background-color",palette[colorname]);
                input.val(palette[colorname]);
                input.attr("colorname",colorname);
                input.change(function(){
                    var cname=$(this).attr("colorname");
                    changePaletteColor(cname,$(this).val());
                });
                input.click(function(){
                    Styler.ColorPicker.show($(this));
                    return false;
                });
                var label=$("<span>"+colorname+"</span>");
                var remove=$("<div class='removecolor'>");
                remove.click(function(){
                    var colorname=$(this).parent().find("input").attr("colorname");
                    delete palette[colorname];
                    repopulatePaletteList();
                });
                citem.append(remove);
                citem.append(input);
                citem.append(label);
                palettelist.append(citem);
            }
        }

        function extractColorPalette(){
            var extractor=/\/\*\s*Color Palette\s*\n([^*]*)\n\s*\*\//mg;
                var match=extractor.exec(oldstyle);
            if(match){
                var palettedata=match[1];
                try {
                    palettedata= JSON.parse(palettedata);
                } catch (e) {
                    console.error("Invalid palette data->" + e.toString());
                    return;
                }
                palette=palettedata.colors;
                $.extend(true,palettegallery,palettedata.palettegallery);
                var colorinputscss=palettedata.inputs;
                for(var inputid in colorinputscss){
                    var colorname=colorinputscss[inputid];
                    for(var inputid2 in colorinputs){
                        if(inputid==inputid2){
                            colorinputs[inputid2].color=colorname;
                        }
                    }
                }
                for(var colorname in palette){
                    changePaletteColor(colorname,palette[colorname]);
                }
            }
        }

        function putColorPaletteData(thecss){
            var palettedata={
                colors:palette,
                palettegallery:palettegallery
            };
            var inputdata={};
            for(var inputid in colorinputs){
                if(colorinputs[inputid].color!==""){
                    inputdata[inputid]=colorinputs[inputid].color;
                }
            }
            palettedata.inputs=inputdata;

            var css=thecss;
            palettedata=JSON.stringify(palettedata,null,4);
            palettedata="/* Color Palette \n"+palettedata+"\n*/";

            var extractor=/\/\*\s*Color Palette\s*\n([^*]*)\n\s*\*\//mg;
                var match=extractor.exec(thecss);
            if(match){
                css=css.replace(extractor,palettedata);
            }else{
                css=css+"\n"+palettedata;
            }
            return css;
        }

        function changePaletteTheme(themename){
            var theme;
            for(var index in palettegallery){
                if(palettegallery[index].name==themename){
                    theme=palettegallery[index].colors;
                }
            }
            for(var colorname in theme){
                changePaletteColor(colorname,theme[colorname]);
            }
            repopulatePaletteList();
        }

        function changePaletteColor(colorname,value){
            palette[colorname]=value;
            palettediv.find("input[colorname='"+colorname+"']").val(value);
            palettediv.find("input[colorname='"+colorname+"']").css("background-color",value);
            for(var inputid in colorinputs){
                if(colorinputs[inputid].color==colorname){
                    colorinputs[inputid].input.val(value);
                    colorinputs[inputid].input.change();
                }
            }
        }

        function registerColorInput(uid,input){
            colorinputs[uid]={input:input,color:""};
        }

        function setInputColor(inputid,color){
            if(colorinputs[inputid]===undefined){
                console.warn("WARNING color input not registered ->"+inputid);
                return "";
            }
            colorinputs[inputid].color=color;
            $(colorinputs[inputid].input).val(palette[color]);
            $(colorinputs[inputid].input).css("background-color",palette[color]);
        }

        function getCurrentColorName(inputid){
            if(colorinputs[inputid]===undefined){
                console.warn("WARNING color input not registered ->"+inputid);
                return "";
            }
            return colorinputs[inputid].color;
        }

        function getPalette(){
            return palette;
        }

        stylerobj.getCurrentColorName=getCurrentColorName;
        stylerobj.setInputColor=setInputColor;
        stylerobj.registerColorInput=registerColorInput;
        stylerobj.getPalette=getPalette;

        if(parsearg.preparse){
            updateCss(oldstyle);
        }

        Styler.ColorPicker.initialize(args.color_picker);
        return stylerobj;

    };

    return initializer;
})(jQuery);


/* global window, jQuery, Styler:true, console */

Styler = window.Styler || {};

/* Styler meta contains builders for css controls avalable */
Styler.Meta = (function(Styler, styler_meta, $){

    var _counter = 0; // For generating unique id.
    function radiobuilder(theval) {
        function builder(stylerobj,option) {
            var selector=option.selector;
            var cssproperty=option.css;
            var values = theval;
            if (option && option.values) {
                $.extend(values, option.values);
            }
            _counter = _counter + 1;
            var uid = selector.replace(" ", "_") + cssproperty.replace(" ", "_") + _counter.toString();
            var container = $("<div id='" + uid + "' class='btn-group' data-toggle='buttons' style='inline-block'>");

            for ( var index in values) {
                var value = values[index];
                var chid = uid + value.replace(" ", "_");
                
                var radiobutton = $("<input></input>");
                radiobutton.attr("id", chid);
                radiobutton.attr("value", value);
                radiobutton.attr("type", "radio");
                radiobutton.attr("name", uid + "radio");

                var label = $("<label class='btn btn-default'>");
                label.text(value);
                label.attr("for", chid);
                label.append(radiobutton);

                container.append(label);
            }

            container.find("input").change(function() {
                stylerobj.modifycss(selector, cssproperty, $(this).val());
            });
            function handler(csstring) {
                var theinput = container.find("input[value=" + csstring + "]");

                if (theinput.length === 0) {
                    console.log("Warning, trying to set unknown value to input->" + csstring);
                    return;
                }

                container.find("input[checked=checked]").attr("checked",
                "false");
                container.find("input")[0].checked = true;
                var theinput = container.find("input[value=" + csstring + "]");
                theinput.attr("checked", true);
                container.find('label.active').removeClass('active');
                theinput.parent('label').addClass('active');
            }
            stylerobj.registercsshandler(selector, cssproperty, handler);
            return container;
        }
        return builder;
    }

    // Fourslider is a combination of seven slider in three configuration.
    // Used for property like margin and padding where the parameter can be one to four number.
    // The three configuration are shown as tabs. The first is with one number,
    // second with two number, and third with four number.
    // The second can be disable using the option 'nodoubletab'
    // Labels for the seven slider can be configured using 'labels' option.
    function foursliderbuilder(defoption) {
        function thebuilder(stylerobj,prefoption) {
            var selector=prefoption.selector;
            var cssproperty=prefoption.css;
            var option = {
                min : 0,
                max : 100,
                unitselector : [ {
                    name : "Percent",
                    postfix : "%"
                }, {
                    name : "Pixel",
                    postfix : "px"
                } ]
            };
            $.extend(option, defoption, prefoption, {
                registercss : false
            });

            _counter += 1;
            var counter = _counter.toString(); 
            // Get new counter for id generation.

            var container = $("<div class='panel panel-default'>");

            // Generate the tab buttonas.
            var ul = $("<ul class='nav nav-tabs' role='tablist'>");

            ul.append("<li><a href='#single_" + counter + "' data-toggle='tab' class='single_tab'>All</a></li>");
            if (!option.nodoubletab) {
                ul.append("<li><a href='#double_" + counter + "' data-toggle='tab' class='double_tab'>Horizontal/Vertical</a></li>");
            }
            ul.append("<li><a href='#quad_" + counter + "' data-toggle='tab' class='quad_tab'>Top/Right/Bottom/Left</a></li>");

            var labels = {
                all : cssproperty + "-all",
                horizontal : cssproperty + "-horizontal",
                vertical : cssproperty + "-vertical",
                top : cssproperty + "-top",
                right : cssproperty + "-right",
                bottom : cssproperty + "-bottom",
                left : cssproperty + "-left"
            };

            $.extend(labels, option.labels);

            var topval = "";
            var rightval = "";
            var bottomval = "";
            var leftval = "";
            function reapply() {
                var thestring = topval + " " + rightval + " " + bottomval + " " + leftval;
                stylerobj.modifycss(selector, cssproperty, thestring);
            }

            // The sliders
            var topslider = $("<div id='vertical_" + counter + "'>");
            var rightslider = $("<div id='vertical_" + counter + "'>");
            var bottomslider = $("<div id='vertical_" + counter + "'>");
            var leftslider = $("<div id='vertical_" + counter + "'>");
            var verticalslider = $("<div id='vertical_" + counter + "'>");
            var horizontalslider = $("<div id='horizontal_" + counter + "'>");
            var singleslider = $("<div id='single_" + counter + "'>");

            // Adding slider to tab.
            var singletab = $("<div id='single_" + counter + "' class='single tab-pane' style='padding:1ex;'>");
            singletab.append(singleslider);
            var doubletab = $("<div id='double_" + counter + "' class='double tab-pane' style='padding:1ex;'>");
            doubletab.append(verticalslider);
            doubletab.append(horizontalslider);
            var quadtab = $("<div id='quad_" + counter + "' class='quad tab-pane' style='padding:1ex;'>");
            quadtab.append(topslider);
            quadtab.append(rightslider);
            quadtab.append(bottomslider);
            quadtab.append(leftslider);

            var tabcontent = $('<div class="tab-content">');
            tabcontent.append(singletab);
            if (!option.nodoubletab) {
                tabcontent.append(doubletab);
            }
            tabcontent.append(quadtab);

            var panel_body = $("<div class='panel-body'>");
            panel_body.append(ul);
            panel_body.append(tabcontent);
            var panel_heading = $("<div class='panel-heading'><h4 class='panel-title'></h4></div>");
            panel_heading.find('.panel-title').text(option.name);
            container.append(panel_heading);
            container.append(panel_body);


            // The function that is called when Styler said the css changed.
            function handler(text) {
                var numberlist = text.split(" ");
                if (numberlist.length === 0) {
                    console.warn("Someone call setstring with an empty string.");
                    return;
                }
                if (numberlist.length == 1) {
                    singleslider.StylerSlider("string", numberlist[0]);
                    container.find('a.single_tab').tab('show');
                    return;
                }
                if (numberlist.length == 2) {
                    verticalslider.StylerSlider("string", numberlist[0]);
                    horizontalslider.StylerSlider("string", numberlist[1]);
                    container.find('a.double_tab').tab('show');
                    return;
                }
                if (numberlist.length == 4) {
                    topslider.StylerSlider("string", numberlist[0]);
                    rightslider.StylerSlider("string", numberlist[1]);
                    bottomslider.StylerSlider("string", numberlist[2]);
                    leftslider.StylerSlider("string", numberlist[3]);
                    container.find('a.quad_tab').tab('show');
                    return;
                }
            }
            stylerobj.registercsshandler(selector, cssproperty, handler);

            //Initialize quad sliders
            topslider.StylerSlider($.extend({}, {
                cssprop : labels.top,
                change : function(event, text) {
                    topval = topslider.StylerSlider("string");
                    reapply();
                }
            }, option));
            rightslider.StylerSlider($.extend({}, {
                cssprop : labels.right,
                change : function(event, text) {
                    rightval = rightslider.StylerSlider("string");
                    reapply();
                }
            }, option));
            bottomslider.StylerSlider($.extend({}, {
                cssprop : labels.bottom,
                change : function(event, text) {
                    bottomval = bottomslider.StylerSlider("string");
                    reapply();
                }
            }, option));
            leftslider.StylerSlider($.extend({}, {
                cssprop : labels.left,
                change : function(event, text) {
                    leftval = leftslider.StylerSlider("string");
                    reapply();
                }
            }, option));

            //Initialize dual sliders
            verticalslider.StylerSlider($.extend({}, {
                cssprop : labels.vertical,
                change : function(event, text) {
                    topslider.StylerSlider('string', text);
                    bottomslider.StylerSlider('string', text);
                }
            }, option));
            horizontalslider.StylerSlider($.extend({}, {
                cssprop : labels.horizontal,
                change : function(event, text) {
                    rightslider.StylerSlider('string', text);
                    leftslider.StylerSlider('string', text);
                }
            }, option));

            //Initialize single sliders
            singleslider.StylerSlider($.extend({}, {
                cssprop : labels.all,
                change : function(event, text) {
                    verticalslider.StylerSlider('string', text);
                    horizontalslider.StylerSlider('string', text);
                }
            }, option));

            return container;
        }
        return thebuilder;
    }

    function selectionbuilder(values) {
        function builder(stylerobj,option) {
            var selector=option.selector;
            var cssproperty=option.css;
            var container = $("<select class='form-control'>");
            for ( var index in values) {
                var value = values[index];
                container.append("<option>" + value + "</option>");
            }
            container.change(function() {
                stylerobj.modifycss(selector, cssproperty, $(this).val());
            });
            function handler(csstring) {
                container.val(csstring);
            }
            stylerobj.registercsshandler(selector, cssproperty, handler);
            return container;
        }
        return builder;
    }

    function defaultbuilder(stylerobj,option) {
        var selector=option.selector;
        var cssproperty=option.css;
        var theinput = $("<input class='default form-control'>");
        $(theinput).change(function() {
            stylerobj.modifycss(selector, cssproperty, $(theinput).val());
        });
        function handler(csstring) {
            $(theinput).val(csstring);
        }
        stylerobj.registercsshandler(selector, cssproperty, handler);
        return theinput;
    }
    function checkbox(stylerobj,option) {
        var selector=option.selector;
        var cssproperty=option.css;
        var checkval = option.checked;
        var uncheckval = option.unchecked;
        var theinput = $("<input type='checkbox'>");
        $(theinput).change(function() {
            var togive;
            if (theinput.attr("checked")) {
                togive = checkval;
            } else {
                togive = uncheckval;
            }
            stylerobj.modifycss(selector, cssproperty, togive);
        });
        function handler(csstring) {
            if (csstring == checkval) {
                theinput.attr("checked", "checked");
            } else {
                theinput.attr("checked", "");
            }
        }
        stylerobj.registercsshandler(selector, cssproperty, handler);
        return theinput;
    }

    function boxshadowbuilder(stylerobj,options) {
        var selector=options.selector;
        var cssprop=options.css;

        var container = $("<div class='ui-corner-all ui-widget-content' style='padding:1ex'>");
        var shadowoverall = $('<input></input>');
        var shadowcolorinput = $('<input class="colorinput"></input>');
        var shadowhorizontaloffsetslider = $('<div>');
        var shadowverticaloffsetslider = $('<div>');
        var shadowblurdistanceslider = $('<div>');
        var shadowspreaddistanceslider = $('<div>');
        var shadowinsetcheckbox = $('<input type="checkbox">');

        container.append("Overall shadow:").append(shadowoverall).append(
        "<br />Color:").append(shadowcolorinput).append(
        shadowhorizontaloffsetslider)
        .append(shadowverticaloffsetslider).append(
        shadowblurdistanceslider).append(
        shadowspreaddistanceslider).append("Inset:").append(
        shadowinsetcheckbox);

        var shadow_inset = "";
        var shadow_color = "#000";
        var shadow_horizontal_offset = "0px";
        var shadow_vertical_offset = "0px";
        var shadow_blur_distance = "0px";
        var shadow_spread_distance = "0px";

        function shadowhandler(csstring) {
            var split = csstring.split(" ");
            var curindex = 0;
            if (split[curindex].toLowerCase() == "inset") {
                shadow_inset = "inset";
                shadowinsetcheckbox.attr("checked", "checked");
                curindex += 1;
            }
            var horizoff = split[curindex];
            curindex += 1;
            shadow_horizontal_offset = horizoff;
            shadowhorizontaloffsetslider.StylerSlider('string', horizoff);

            var vertoff = split[curindex];
            curindex += 1;
            shadow_vertical_offset = vertoff;
            shadowverticaloffsetslider.StylerSlider('string', vertoff);

            var endcolor = /#.*/;

            if (!endcolor.test(split[curindex])) {
                var shadowblur = split[curindex];
                curindex += 1;
                shadow_blur_distance = shadowblur;
                shadowblurdistanceslider.StylerSlider('string', shadowblur);
            }

            if (!endcolor.test(split[curindex])) {
                var shadowspread = split[curindex];
                curindex += 1;
                shadow_spread_distance = shadowspread;
                shadowspreaddistanceslider.StylerSlider('string', shadowspread);
            }

            var shadowcolor = split[curindex];
            shadowcolorinput.val(shadowcolor);
            shadowcolorinput.css("background-color",shadowcolor);

        }

        stylerobj.registercsshandler(selector, "box-shadow", shadowhandler);

        function shadow_changed(csstring) {
            stylerobj.modifycss(selector, 'box-shadow', csstring);
        }

        function shadow_overall_changed() {
            var fullstring = shadow_inset + " " + shadow_horizontal_offset +
            " " + shadow_vertical_offset + " " + shadow_blur_distance +
            " " + shadow_spread_distance + " " + shadow_color;
            shadow_changed(fullstring);
            shadowoverall.val(fullstring);
        }

        function shadow_color_change(csstring) {
            shadow_color = csstring;
            shadow_overall_changed();
        }

        function shadow_horizontal_offset_change(csstring) {
            shadow_horizontal_offset = csstring;
            shadow_overall_changed();
        }

        function shadow_vertical_offset_change(csstring) {
            shadow_vertical_offset = csstring;
            shadow_overall_changed();
        }

        function shadow_blur_distance_change(csstring) {
            shadow_blur_distance = csstring;
            shadow_overall_changed();
        }

        function shadow_spread_distance_change(csstring) {
            shadow_spread_distance = csstring;
            shadow_overall_changed();
        }

        function shadow_inset_change(csstring) {
            shadow_inset = csstring;
            shadow_overall_changed();
        }

        shadowoverall.change(function() {
            shadow_changed(shadowoverall.val());
        });

        shadowinsetcheckbox.change(function() {
            if (shadowinsetcheckbox.attr("checked")) {
                shadow_inset_change("inset");
            } else {
                shadow_inset_change("");
            }
        });

        shadowhorizontaloffsetslider.StylerSlider({
            min : -50,
            max : 50,
            cssprop : 'shadow_horizontal_offset',
            registercss : false,
            change : function(event, string) {
                shadow_horizontal_offset_change(string);
            }
        });

        shadowverticaloffsetslider.StylerSlider({
            min : -30,
            max : 30,
            cssprop : 'shadow_vertical_offset',
            registercss : false,
            change : function(event, string) {
                shadow_vertical_offset_change(string);
            }
        });

        shadowblurdistanceslider.StylerSlider({
            min : -30,
            max : 30,
            cssprop : 'shadow_blur_distance',
            registercss : false,
            change : function(event, string) {
                shadow_blur_distance_change(string);
            }
        });

        shadowspreaddistanceslider.StylerSlider({
            min : -30,
            max : 30,
            cssprop : 'shadow_spread_distance',
            registercss : false,
            change : function(event, string) {
                shadow_spread_distance_change(string);
            }
        });

        var shadowinputid=selector+cssprop;
        shadowcolorinput.click(function(){
            Styler.ColorPicker.show(shadowcolorinput,shadowinputid,stylerobj);
            return false;
        });
        stylerobj.registerColorInput(shadowinputid,shadowcolorinput);

        shadowcolorinput.change(function() {
            shadowcolorinput.css('backgroundColor', shadowcolorinput.val());
            shadow_color_change(shadowcolorinput.val());
        });

        return container;
    }
    function colourbuilder(stylerobj,option) {

        var selector=option.selector;
        var cssprop=option.css;
        var input = $("<input class='colorinput'>");
        var inputid=selector+cssprop;
        stylerobj.registerColorInput(inputid,input);
        input.click(function(){
            Styler.ColorPicker.show(input,inputid,stylerobj);
            return false;
        });

        function handler(csstring) {
            console.log("color picker change to->" + csstring);
            input.val(csstring);
            $(input).css("background-color", csstring);
        }

        stylerobj.registercsshandler(selector, cssprop, handler);

        input.change(function() {
            var csstring = input.val();
            input.css('backgroundColor', csstring);
            stylerobj.modifycss(selector, cssprop, csstring);
        });

        return input;
    }

    function textshadowbuilder(stylerobj,option) {
        var selector=option.selector;
        var cssprop=option.css;

        var textshadowcolorinput = $('<input class="colorinput">');
        var textshadowhoffsetslider = $('<div>');
        var textshadowvoffsetslider = $('<div>');
        var textshadowblurslider = $('<div>');
        var container = $("<div>");
        container.append("Text-shadow color:").append(textshadowcolorinput)
        .append(textshadowhoffsetslider)
        .append(textshadowvoffsetslider).append(textshadowblurslider);

        var text_shadow_h_offset = "0px";
        var text_shadow_v_offset = "0px";
        var text_shadow_blur = "0px";
        var text_shadow_color = "#000000";

        function reset_text_shadow() {
            var fullstring = text_shadow_h_offset + " " + text_shadow_v_offset +
              " " + text_shadow_blur + " " + text_shadow_color;
            stylerobj.modifycss(selector, "text-shadow", fullstring);
        }

        function text_shadow_handler(csstring) {
            var split = csstring.split(" ");
            var curindex = 0;

            var horizoff = split[curindex];
            curindex += 1;
            text_shadow_h_offset = horizoff;
            textshadowhoffsetslider.StylerSlider('string', horizoff);

            var vertoff = split[curindex];
            curindex += 1;
            text_shadow_v_offset = vertoff;
            textshadowvoffsetslider.StylerSlider('string', vertoff);

            var endcolor = /#.*/;

            if (!endcolor.test(split[curindex])) {
                var shadowblur = split[curindex];
                curindex += 1;
                text_shadow_blur = shadowblur;
                textshadowblurslider.StylerSlider('string', shadowblur);
            }

            var shadowcolor = split[curindex];
            textshadowcolorinput.val(shadowcolor);
            textshadowcolorinput.css("background-color",shadowcolor);

        }

        stylerobj.registercsshandler(selector, 'text-shadow', text_shadow_handler);

        textshadowhoffsetslider.StylerSlider({
            min : -50,
            max : 50,
            nopostfixchange : true,
            cssprop : 'text-shadow-hoffset',
            registercss : false,
            change : function(event, csstring) {
                text_shadow_h_offset = csstring;
                reset_text_shadow();
            }
        });

        textshadowvoffsetslider.StylerSlider({
            min : -50,
            max : 50,
            nopostfixchange : true,
            cssprop : 'text-shadow-voffset',
            registercss : false,
            change : function(event, csstring) {
                text_shadow_v_offset = csstring;
                reset_text_shadow();
            }
        });

        textshadowblurslider.StylerSlider({
            min : 0,
            max : 50,
            nopostfixchange : true,
            cssprop : 'text-shadow-blur',
            registercss : false,
            change : function(event, csstring) {
                text_shadow_blur = csstring;
                reset_text_shadow();
            }
        });

        var textshadowinputid=selector+cssprop;
        textshadowcolorinput.click(function(){
            Styler.ColorPicker.show(textshadowcolorinput,textshadowinputid,stylerobj);
            return false;
        });
        stylerobj.registerColorInput(textshadowinputid,textshadowcolorinput);

        textshadowcolorinput.change(function() {
            textshadowcolorinput.css('backgroundColor', textshadowcolorinput
                .val());
                text_shadow_color = (textshadowcolorinput.val());
                reset_text_shadow();
        });

        return container;
    }

    function backgroundrepeatbuilder(stylerobj,option) {
        var selector=option.selector;
        //var cssprop=option.css; //Unused

        var container = $("<div>");
        var backgroundimagerepeatx = $('<input type="checkbox">');
        var backgroundimagerepeaty = $('<input type="checkbox">');
        container.append("repeat-x : ");
        container.append(backgroundimagerepeatx);
        container.append("<br />").append("repeat-y : ");
        container.append(backgroundimagerepeaty);
        var background_image_repeat_x = "";
        var background_image_repeat_y = "";
        function background_image_repeat_reload() {
            var repeatx = (background_image_repeat_x == "repeat-x");
            var repeaty = (background_image_repeat_y == "repeat-y");

            var fullstring = "no-repeat";

            if (repeaty) {
                fullstring = "repeat-y";
            }

            if (repeatx) {
                fullstring = "repeat-x";
            }

            if (repeaty && repeatx) {
                fullstring = "repeat";
            }
            stylerobj.modifycss(selector, 'background-repeat', fullstring);
        }

        function backgroundimagerepeathandler(csstring) {
            var trimmed = $.trim(csstring);
            if (trimmed == 'no-repeat') {
                background_image_repeat_x = "";
                background_image_repeat_y = "";
                backgroundimagerepeatx.prop('checked', false);
                backgroundimagerepeaty.prop('checked', false);
            }
            if (trimmed == 'repeat') {
                background_image_repeat_x = "repeat-x";
                background_image_repeat_y = "repeat-y";
                backgroundimagerepeatx.prop('checked', true);
                backgroundimagerepeaty.prop('checked', true);
            }
            if (trimmed == 'repeat-x') {
                background_image_repeat_x = "repeat-x";
                backgroundimagerepeatx.prop('checked', true);
                background_image_repeat_y = "";
                backgroundimagerepeaty.prop('checked', false);
            }
            if (trimmed == 'repeat-y') {
                background_image_repeat_y = "repeat-y";
                backgroundimagerepeaty.prop('checked', true);
                background_image_repeat_x = "";
                backgroundimagerepeatx.prop('checked', false);
            }
        }
        stylerobj.registercsshandler(selector, 'background-repeat',
        backgroundimagerepeathandler);

        function background_image_repeat_x_change(csstring) {
            background_image_repeat_x = csstring;
            background_image_repeat_reload();
        }

        function background_image_repeat_y_change(csstring) {
            background_image_repeat_y = csstring;
            background_image_repeat_reload();
        }

        backgroundimagerepeatx.change(function() {
            if (backgroundimagerepeatx.attr("checked")) {
                background_image_repeat_x_change("repeat-x");
            } else {
                background_image_repeat_x_change("");
            }
        });

        backgroundimagerepeaty.change(function() {
            if (backgroundimagerepeaty.attr("checked")) {
                background_image_repeat_y_change("repeat-y");
            } else {
                background_image_repeat_y_change("");
            }
        });

        return container;
    }

    function backgroundurlbuilder(stylerobj,option) {
        var selector=option.selector;
        var cssproperty=option.css;

        var backgroundimageurlinput = $("<input style='width:100%;' class='form-control'>");
        var extractor = /url\((.*)\)/;
        $(backgroundimageurlinput).change(function() {
            var theurl = backgroundimageurlinput.val();
            if (extractor.test(theurl)) {
                stylerobj.modifycss(selector, 'background-image', theurl);
            } else {
                stylerobj.modifycss(selector, 'background-image', "url(" + theurl + ")");
            }
        });
        function handler(csstring) {
            if (extractor.test(csstring)) {
                backgroundimageurlinput.val(extractor.exec(csstring)[1]);
            } else {
                backgroundimageurlinput.val(csstring);
            }
        }
        stylerobj.registercsshandler(selector, cssproperty, handler);

        var container = $("<div>");
        container.append(backgroundimageurlinput);
        return container;
    }
    function sliderbuilder(defoption) {
        function innerbuilder(stylerobj,option) {
            var selector=option.selector;
            var cssprop=option.css;

            var predefoption = {
                cssprop : cssprop,
                selector : selector,
                registercss : true,
                stylerobj:stylerobj,
                label : false,
                unitselector : [ {
                    name : "Percent",
                    postfix : "%"
                }, {
                    name : "Pixel",
                    postfix : "px"
                } ]
            };
            var newoption = $.extend({}, predefoption, defoption, option);
            var thediv = $("<span>");
            thediv.StylerSlider(newoption);
            return thediv;
        }
        return innerbuilder;
    }

    function backgroundsizebuilder(stylerobj,option) {

        var selector=option.selector;
        var cssprop=option.css;

        var slideroption = {
            cssprop : cssprop,
            selector : selector,
            registercss : false,
            label : false,
            unitselector : [ {
                name : "Percent",
                postfix : "%"
            }, {
                name : "Pixel",
                postfix : "px"
            } ]
        };

        var height = "100%";
        var width = "100%";
        var state = "custom";

        _counter = _counter + 1;
        var uid = "background_size" + _counter;
        var radiobutton = $("<div class='btn-group' data-toggle='buttons'></div>");

        var radid = "radio_" + uid + "_custom";
        radiobutton
        .append("<label class='btn btn-default' for='" + radid +
            "'><input id='" + radid + "' type='radio' name='radio_" +
            uid + "' value='custom'/>custom</label>");
        var radid = "radio_" + uid + "_cover";
        radiobutton.append("<label class='btn btn-default for='" + radid + "'><input id='" + radid +
            "' type='radio' name='radio_" + uid +
            "' value='cover'/>cover</label>");
        var radid = "radio_" + uid + "_contain";
        radiobutton.append("<label class='btn btn-default for='" + radid +
            "'><input id='" + radid + 
            "' type='radio' name='radio_" + uid +
            "' value='contain'/>contain</label>");

        var customcontainer = $("<div>");
        function enablecustom() {
            console.log("custom enabled");
            customcontainer.find("div").removeAttr("disabled");
            customcontainer.find("input").removeAttr("disabled");
        }

        function disablecustom() {
            console.log("custom disabled");
            customcontainer.find("div").attr("disabled", "disabled");
            customcontainer.find("input").attr("disabled", "disabled");
        }

        $(radiobutton).find("input[type=radio]").change(function() {
            var thevalue = $(this).val();
            if (thevalue == "custom") {
                enablecustom();
            } else {
                disablecustom();
            }
            state = thevalue;
            reapply();
        });

        function get_cssstring() {
            if (state == "custom") {
                return width + " " + height;
            }
            return state;
        }

        function reapply() {
            stylerobj.modifycss(selector, cssprop, get_cssstring());
        }

        var heightslider = $("<div>");
        $(heightslider).StylerSlider($.extend({}, slideroption, {
            change : function(event, csstring) {
                height = csstring;
                reapply();
            }
        }));

        var widthslider = $("<div>");
        $(widthslider).StylerSlider($.extend({}, slideroption, {
            change : function(event, csstring) {
                width = csstring;
                reapply();
            }
        }));

        function reapplytocontrol() {
            if (state == "custom") {
                enablecustom();
            } else {
                disablecustom();
            }
            $(heightslider).StylerSlider('string', height);
            $(widthslider).StylerSlider('string', width);
            $(radiobutton).find("input[type=radio]").attr("checked", "");
            $(radiobutton).find("input[type=radio][value=" + state + "]").attr(
            "checked", "checked");
        }

        function handler(css) {
            var theex = /\s*([^\s]+)\s+([^\s]+)\s*/;
            var match = theex.exec(css);
            if (match) {
                height = match[2];
                width = match[1];
                state = "custom";
                reapplytocontrol();
            } else {
                state = css;
                reapplytocontrol();
            }
        }

        stylerobj.registercsshandler(selector, cssprop, handler);

        var container = $("<div>");
        container.append(radiobutton);

        customcontainer.append("<span>height:</span>").append(heightslider)
        .append("<span>width:</span>").append(widthslider).append(
        "<br />");

        container.append(customcontainer);

        disablecustom();

        return container;
    }

    styler_meta.predefcustomcss = {
        "text" : {
            "type":"emptygroup",
            "name" : "text",
            "controls" : [ {
                "css" : "font-family"
            }, {
                "css" : "font-size"
            }, {
                "css" : "text-align"
            }, {
                "css" : "font-style"
            }, {
                "css" : "font-weight"
            }, {
                "css" : "text-decoration"
            }, {
                "css" : "text-transform"
            } ]
        },
        "background" : {
            "type":"emptygroup",
            "name" : "background",
            "controls" : [ {
                "css" : "background-color"
            }, {
                "css" : "background-attachment"
            }, {
                "css" : "background-origin"
            }, {
                "css" : "background-image"
            }, {
                "css" : "background-size"
            }, {
                "css" : "background-repeat"
            } ]
        },
        "border" : {
            "type":"emptygroup",
            "name" : "border",
            "controls" : [ {
                "css" : "border-style"
            }, {
                "css" : "border-color"
            }, {
                "css" : "border-width"
            } ]
        }
    };

    styler_meta.nolabel = [
      "text",
      "border",
      "background",
      "padding",
      "border-width",
      "border-radius",
      "margin",
      "padding",
    ];
    styler_meta.nobr = [ "checkbox", "colourbuilder" ];

    styler_meta.predefbuilders = {
        "border-color" : colourbuilder,
        "border-width" : foursliderbuilder({
            postfix : "px",
            min : 0,
            max : 20
        }),
        "border-style" : selectionbuilder([ "none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "inherit" ]),
        "border-radius" : foursliderbuilder({
            nodoubletab : true,
            labels : {
                all : "all",
                top : "top-left",
                right : "top-right",
                bottom : "bottom-right",
                left : "bottom-left"
            }
        }),
        "border-top-left-radius" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "border-top-right-radius" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "border-bottom-left-radius" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "border-bottom-right-radius" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "box-shadow" : boxshadowbuilder,
        "background-color" : colourbuilder,
        "background-attachment" : radiobuilder([ "inherit", "scroll", "fixed" ]),
        "background-origin" : radiobuilder([ "padding-box", "border-box", "content-box" ]),
        "background-image" : backgroundurlbuilder,
        "background-size" : backgroundsizebuilder,
        "background-repeat" : backgroundrepeatbuilder,
        "color" : colourbuilder,
        "margin" : foursliderbuilder({
            postfix : "px"
        }),
        "margin-top" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "margin-right" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "margin-bottom" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "margin-left" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "padding" : foursliderbuilder({
            postfix : "px"
        }),
        "padding-top" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "padding-right" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "padding-bottom" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "padding-left" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "px"
        }),
        "width" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "%"
        }),
        "height" : sliderbuilder({
            min : 0,
            max : 100,
            postfix : "%"
        }),
        "opacity" : sliderbuilder({
            min : 0,
            max : 1,
            postfix : "",
            nopostfixchange : true
        }),
        "font-family" : selectionbuilder([ 
            "inherit",
            "Impact, Charcoal, sans-serif",
            "‘Palatino Linotype’, ‘Book Antiqua’, Palatino, serif",
            "Tahoma, Geneva, sans-serif", "Century Gothic, sans-serif",
            "‘Lucida Sans Unicode’, ‘Lucida Grande’, sans-serif",
            "‘Arial Black’, Gadget, sans-serif",
            "‘Times New Roman’, Times, serif",
            "‘Arial Narrow’, sans-serif", "Verdana, Geneva, sans-serif",
            "Copperplate Gothic Light, sans-serif",
            "‘Lucida Console’, Monaco, monospace",
            "Gill Sans / Gill Sans MT, sans-serif",
            "‘Trebuchet MS’, Helvetica, sans-serif",
            "‘Courier New’, Courier, monospace",
            "Arial, Helvetica, sans-serif", "Georgia, Serif",
            "'Comic Sans MS', cursive, sans-serif",
            "'Bookman Old Style', serif", "Garamond, serif",
            "Symbol, sans-serif", "Webdings, sans-serif",
            "Wingdings, 'Zapf Dingbats', sans-serif" 
        ]),
        "font-style" : radiobuilder([ "inherit", "normal", "italic", "oblique" ]),
        "font-variant" : radiobuilder([ "inherit", "normal", "small-caps" ]),
        "font-weight" : radiobuilder([ "inherit", "normal", "bold", "bolder", "lighter" ]),
        "font-size" : sliderbuilder({
            min : 0,
            max : 150,
            postfix : "%"
        }),
        "text-align" : radiobuilder([ "inherit", "left", "center", "right", "justify" ]),
        "text-decoration" : radiobuilder([ "inherit", "none", "underline", "overline", "line-through", "blink" ]),
        "text-indent" : sliderbuilder({
            min : 0,
            max : 300,
            postfix : "px"
        }),
        "text-transform" : radiobuilder([ "inherit", "none", "capitalize", "uppercase", "lowercase" ]),
        "text-shadow" : textshadowbuilder
    };

    styler_meta.builders = {
        "checkbox" : checkbox,
        "color" : colourbuilder,
        "slider" : sliderbuilder({}),
        "fourslider" : foursliderbuilder({}),
        "radio" : radiobuilder({}),
        "default" : defaultbuilder,
        "backgroundurlbuilder" : backgroundurlbuilder
    };

    styler_meta.defaultvalues = {
        "border-color" : "transparent",
        "border-width" : "0",
        "border-style" : "none",
        "border-top-left-radius" : "0px",
        "border-top-right-radius" : "0px",
        "border-bottom-right-radius" : "0px",
        "border-bottom-left-radius" : "0px",
        "box-shadow" : "0px 0px 0px 0px #000000",
        "background-color" : "transparent",
        "background-image" : "none",
        "background-repeat" : "repeat",
        "background-size" : "auto auto",
        "margin-top" : "0",
        "margin-right" : "0",
        "margin-bottom" : "0",
        "margin-left" : "0",
        "padding" : "0px",
        "width" : "auto",
        "height" : "auto",
        "opacity" : "1",
        "font-family" : "inherit",
        "font-style" : "normal",
        "font-variant" : "normal",
        "font-weight" : "normal",
        "font-size" : "100%",
        "text-align" : "left",
        "text-decoration" : "none",
        "text-indent" : "0px",
        "text-transform" : "none",
        "text-shadow" : "0px 0px 0px #000000"
    };

    return styler_meta;

})( Styler, Styler.Meta || {} , jQuery);


/* global jQuery, _ */

// Styler slider is a common widget used in various builder,
// Its basically a slider with min and max input and units.
// The slider itself has a value between 0 to 1000 and from that
// value and min and max it calculate the actual value.

(function($){

    $.widget('styler.StylerSlider',{
        options : {
            min : 0,
            max : 100,
            postfix : 'px',
            nopostfixchange : false,
            cssprop : '',
            selector : '',
            unitselector : [],
            registercss : true,
            stylerobj : {},
            label : true,
            sliderops : {},
            decimalpoint : 2
        },
        _create : function() {
            var that = this;
            var cssprop = that.options.cssprop;
            var unitselector = that.options.unitselector;
            if (cssprop === '') {
                throw 'cssprop must not be empty';
            }

            var selectorstring = "";
            if (unitselector.length !== 0) {
                
                selectorstring += "<div class='input-group-btn unitselector'>";
                selectorstring += "<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='curunit'>"+unitselector[0].name+"</span> <span class='caret'></span></button>";
                selectorstring += "<ul class='dropdown-menu dropdown-menu-right' role='menu'>";

                for(var i=0; i<unitselector.length ;i++){
                    selectorstring += "<li><a href='#'>" + unitselector[i].name + "</a></li>";
                }
                selectorstring += "</ul>";
                selectorstring += "</div>";
                selectorstring += "</div>";

            }

            //set label if available. Else, just add the input
            if (that.options.label) {
                $(this.element).append("<div class='input-group'>"+
                                   "<span class='input-group-addon'>"+cssprop+"</span>"+
                                   "<input class='sliderpreval form-control input-sm' type=text name='" + cssprop + "'></input>" + selectorstring + 
                                   "</div><br />");
            }else{
                $(this.element).append("<div class='input-group'>"+
                                   "<input class='sliderpreval form-control input-sm' type=text name='" + cssprop + "'></input>" + selectorstring + 
                                   "</div><br />");
            }
            $(this.element).addClass('stylerslider');
            $(this.element).append("<input type='text' class='minunit minmax'/><div class='cssslider'><div class='placeholder'></div></div><input type='text' class='maxunit minmax'/>");


            var theslider = $(this.element).find(".cssslider .placeholder");
            var sliderobj = null;
            var theinput = $(this.element).find("[name=" + cssprop + "]");
            var theunitselector = $(this.element).find('.unitselector');
            var theminunit = $(this.element).find('input.minunit');
            var themaxunit = $(this.element).find('input.maxunit');

            theminunit.val(that.options.min);
            themaxunit.val(that.options.max);

            var sliderchange = _.bind(this.changeHandler,this);

            theminunit.change(sliderchange);
            themaxunit.change(sliderchange);

            sliderobj = theslider.slider($.extend({}, {
                max : 1000,
                min : 0,
                tooltip: 'hide',
                step : 0.1,
            }, this.options.sliderops))
            .on('slide',sliderchange)
            .on('slideStop',sliderchange)
            .data('slider');

            //When unit change
            if (unitselector.length !== 0) {
                theunitselector.on('click','li > a',function() {
                    var thename = $(this).text();
                    var un = _.find(unitselector,function(unit){
                        return unit.name == thename;
                    });
                    if(un !== undefined){
                        that.postfix(un.postfix);
                        that._trigger('change', 0, that.string());
                    }
                });
            }

            theinput.change(_.bind(this.inputChangeHandler,this));

            // Disable register css when used by fourslider
            if (this.options.registercss) {
                var changehandler = function(event, string) {
                    if (that.options.cssprop !== '') {
                        that.options.stylerobj.modifycss(that.options.selector,that.options.cssprop, string.toString());
                    }
                };

                if (!this.options.change) {
                    this.options.change = changehandler;
                }

                var csshandler = function(csstring) {
                    that.string(csstring);
                };

                this.options.stylerobj.registercsshandler(that.options.selector, cssprop, csshandler);
            }

            that.sliderobj = sliderobj;

        },

        // What happen when the user explicitly change the input?
        inputChangeHandler: function(){
            var theinput = $(this.element).find("[name=" + this.options.cssprop + "]");
            var theminunit = $(this.element).find('input.minunit');
            var themaxunit = $(this.element).find('input.maxunit');


            var extractor = /(\d+)([^\s\d]*)/;
            var thetext = theinput.val();

            if (!extractor.test(thetext)) {
                this._trigger('change', 0, thetext);
                return;
            }

            var thepostfix = extractor.exec(thetext)[2];
            var thenumber = parseFloat(extractor.exec(thetext)[1]);

            this.postfix(thepostfix);
            var min = parseFloat(theminunit.val(), 10);
            var max = parseFloat(themaxunit.val(), 10);

            if (min > thenumber) {
                theminunit.val(parseFloat(thenumber, 10));
                var min = parseFloat(theminunit.val(),10);
            }
            if (max < thenumber) {
                themaxunit.val(parseFloat(thenumber, 10));
                var max = parseFloat(themaxunit.val(),10);
            }

            var different = max - min;
            var difval = parseFloat(thenumber) - parseFloat(min);
            var percentage = difval * 1000 / different;

            this.sliderobj.setValue(percentage);
            this.changeHandler();
        },

        //Function that is called when value changed.
        //it will calculate the value based on the max and min value.
        changeHandler: function sliderchange() {
            var theminunit = $(this.element).find('input.minunit');
            var themaxunit = $(this.element).find('input.maxunit');
            var min = parseInt(theminunit.val(), 10);
            var max = parseInt(themaxunit.val(), 10);
            var theinput = $(this.element).find("[name=" + this.options.cssprop + "]");
            var different = max - min;
            var currentvalue = min + different * (parseInt(this.sliderobj.getValue(), 10) / 1000);
            currentvalue = currentvalue.toFixed(this.options.decimalpoint);
            var thetext = currentvalue + this.options.postfix;
            theinput.val(thetext);
            this._trigger('change', 0, thetext);
        },

        // Change current postfix
        postfix : function(newpostfix, nounit) {
            if (newpostfix === undefined) {
                return this.options.postfix;
            }

            if (this.options.nopostfixchange && this.options.unitselector.length === 0) {
                return;
            }
            if (this.options.nopostfixchange) {
                var isok = false;
                var i = 0;
                var unitselector = this.options.unitselector;
                while (i < unitselector.length) {
                    if (unitselector[i].postfix == newpostfix) {
                        isok = true;
                    }
                    i = i + 1;
                }
                if (!isok) {
                    return;
                }
            }

            var theminunit = $(this.element).find('input.minunit');
            var themaxunit = $(this.element).find('input.maxunit');

            var min = parseFloat(theminunit.val(), 10);
            var max = parseFloat(themaxunit.val(), 10);

            this.options.postfix = newpostfix;
            var theinput = $(this.element).find("[name=" + this.options.cssprop + "]");
            var thetext = ((max - min) * this.sliderobj.getValue() / 1000 + min) + this.options.postfix;
            theinput.val(thetext);
            if (!nounit && this.options.unitselector.length !== 0) {
                var theunitselector = $(this.element).find('.unitselector');
                var unitselector = this.options.unitselector;
                var i = 0;
                while (i < unitselector.length) {
                    if (unitselector[i].postfix == newpostfix) {
                        theunitselector.find('.curunit').text(unitselector[i].name);
                    }
                    i = i + 1;
                }
            }
        },
        string : function(newval) {
            if (newval === undefined) {
                return $(this.element).find("[name=" + this.options.cssprop + "]").val();
            }
            var extractor = /([\d.]+)([^\s\d.]*)/;
            var numbernopostfix = /^\s*[\d.]+\s*$/;

            var thepostfix;
            var thenumber;

            if (numbernopostfix.test(newval)) {
                var number = parseFloat(newval, 10);
                thepostfix = this.options.postfix;
                thenumber = number;
            } else {
                $(this.element).find("[name=" + this.options.cssprop + "]").val(newval);
                if (!extractor.test(newval)) {
                    return;
                }

                thepostfix = extractor.exec(newval)[2];
                thenumber = parseFloat(extractor.exec(newval)[1],10);
            }

            this.postfix(thepostfix);
            var theminunit = $(this.element).find('input.minunit');
            var themaxunit = $(this.element).find('input.maxunit');

            var min = parseFloat(theminunit.val(), 10);
            var max = parseFloat(themaxunit.val(), 10);

            if (min > thenumber) {
                theminunit.val(parseFloat(thenumber, 10));
                var min = parseFloat(theminunit.val(), 10);
            }
            if (max < thenumber) {
                themaxunit.val(parseFloat(thenumber, 10));
                var max = parseFloat(themaxunit.val(), 10);
            }

            var different = max - min;
            var difval = parseFloat(thenumber) - parseFloat(min);
            var percentage = difval * 1000 / different;

            this.sliderobj.setValue(percentage);
            this.changeHandler();
        }
    });

})(jQuery);
