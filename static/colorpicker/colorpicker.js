
function RGBToHSL(r, g, b) {
    var
    min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    diff = max - min,
    h = 0, s = 0, l = (min + max) / 2;
    if (diff != 0) {
        s = l < 0.5 ? diff / (max + min) : diff / (2 - max - min);

        h = (r == max ? (g - b) / diff : g == max ? 2 + (b - r) / diff : 4 + (r - g) / diff) * 60;
    }
    if(h<0){
        h=h+360;
    }
    return [h, s, l];
}

function HSLToRGB(h,s,l) {
    if (s == 0) {
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

if(window.staticpath==undefined){
	window.staticpath="/static/colorpicker/";
}

function initColorChooser(){
    
	if(!$("#colorchooser").length){
		var containerdata="\x3Cdiv id=\'colorchooser\'\x3E\n        \x3Cdiv class=\'innercontainer\'\x3E\n        \x3Ccanvas class=\'colorcanvas\' width=\"200\" height=\"230\"\x3E\x3C\x2Fcanvas\x3E\n        \x3Cdiv class=\'sidebox\'\x3E\n            \x3Cdiv class=\'backboxtile\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'previewbox\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'comparebox\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'inputbox\'\x3E\n            \x3Cspan class=\'label\'\x3EHue:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'hue\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3ESaturation:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'saturation\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3ELightness:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'lightness\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3Cspan class=\'label\'\x3EAlpha:\x3C\x2Fspan\x3E\x3Cbr \x2F\x3E\n            \x3Cinput name=\'alpha\'\x3E\x3C\x2Finput\x3E\x3Cbr \x2F\x3E\n            \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3Cdiv class=\'palettebox\'\x3E\n            \x3Cdiv class=\'paletteicon\'\x3E\x3C\x2Fdiv\x3E\n            \x3Cdiv class=\'palettelist\'\x3E\n                \n            \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E\n        \x3C\x2Fdiv\x3E";
		$("body").append(containerdata);
	}
	
    var maincontainer=$("#colorchooser");
    var maincanvas=maincontainer.find(".colorcanvas");
    var previewbox=maincontainer.find('.previewbox');
    var comparebox=maincontainer.find('.comparebox');
    var huecircle=new Image();
    huecircle.src=staticpath+'huecircle.png';
    var backtile=new Image();
    backtile.src=staticpath+'backtile.png';
    var alphatile=new Image();
    alphatile.src=staticpath+'alphatile.png';
    
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
            maininput.change();
            inputchanging=false;
        }
        if(opacity!=1){
            if(mode==0 || mode==1 || mode==2){
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
        if(mode==0 || mode==1){
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
        lighness=l;
        opacity=1;
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
        var match;
        if(match=tester.exec(text)){
            mode=0;
            fromHash(match[1].slice(0,2),match[1].slice(2,4),match[1].slice(4,6));
            return;
        }
        tester=/^\s*#([0-o9a-fA-F]{3})\s*$/;
        match=undefined;
        if(match=tester.exec(text)){
            mode=1;
            fromHash(match[1].slice(0,1),match[1].slice(1,2),match[1].slice(2,3));
            return;
        }
        tester=/^\s*rgb\((\d+),(\d+),(\d+)\)\s*$/;
        match=undefined;
        if(match=tester.exec(text)){
            mode=2;
            fromRGBA(match[1],match[2],match[3],1);
            return;
        }
        tester=/^\s*rgba\((\d+),(\d+),(\d+),([\d\.]+)\)\s*$/;
        match=undefined;
        if(match=tester.exec(text)){
            mode=3;
            fromRGBA(match[1],match[2],match[3],match[4]);
            return;
        }
        tester=/^\s*hsl\((\d+),(\d+)%?,(\d+)%?\)\s*$/;
        match=undefined;
        if(match=tester.exec(text)){
            mode=4;
            fromHSLA(match[1],match[2],match[3],1);
            return;
        }
        tester=/^\s*hsla\((\d+),(\d+)%?,(\d+)%?,([\d\.]+)\)\s*$/;
        match=undefined;
        if(match=tester.exec(text)){
            mode=5;
            fromHSLA(match[1],match[2],match[3],match[4]);
            return;
        }
        console.log("WARNING unknown color value.->"+text);
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
            
            function unbind(){
                maincanvas.unbind('mouseup'); 
                maincanvas.unbind('mouseout'); 
                maincanvas.unbind('mousemove'); 
            }
            
            maincanvas.bind('mouseup',unbind);
            maincanvas.bind('mouseout',unbind);
            
            return false;
        }
        
        if(x>50 && x<150 && y>50 && y<150){
            
            function modify(x,y){
                saturation=x;
                lightness=100-y;
                draw();
                updateInput();
            }
            
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
            
            function unbind(){
                maincanvas.unbind('mouseup'); 
                maincanvas.unbind('mouseout'); 
                maincanvas.unbind('mousemove'); 
            }
            
            maincanvas.bind('mouseup',unbind);
            maincanvas.bind('mouseout',unbind);
            
            return false;
        }
        
        if(x>5 && x<195 && y>205 && y<225){
            
            function modifyo(x){
                opacity=x/190;
                opacity=roundNumber(opacity,3);
                updateInput();
            }
            
            modifyo(x-5,y-205);
            
            maincanvas.bind('mousemove',function(e){
                var offset=maincanvas.offset();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                var thex=x-5;
                var they=y-205;
                if(thex<0){
                    thex=0;
                }
                if(thex>190){
                    thex=190;
                }
                modifyo(thex);
                return false;
            });
            
            function unbind(){
                maincanvas.unbind('mouseup'); 
                maincanvas.unbind('mouseout'); 
                maincanvas.unbind('mousemove'); 
            }
            
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
        $("body").unbind("click",hide);
        maininput.unbind("change",mainInputChange);
        maininput=false;
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
    
    showColorChooser=function(input,inputidp,stylerobjp){
        
        function initit(){
        	
        	if(inputidp!=undefined){
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
            maincontainer.slideDown();
            $("body").click(hide);
            maininput=input;
            maininput.bind('change',mainInputChange);
            comparebox.css("background-color",maininput.val());
            parseValue(maininput.val());
        }
        
        if(maininput==input){
            return;
        }
        if(maininput && maininput!=input){
            maincontainer.slideUp(initit);
            return;
        }
        initit();
    }
    
}

initColorChooser();