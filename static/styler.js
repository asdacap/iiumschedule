
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
		label: true,
		sliderops : {}
	},
	_create : function() {
		var that = this;
		var cssprop = that.options.cssprop;
		var unitselector = that.options.unitselector;
		if (cssprop == '') {
			throw 'cssprop must not be empty';
		}

		var selectorstring = "";
		if (unitselector.length != 0) {
			selectorstring = "<select class='unitselector'>";
			var i = 0;
			while (i < unitselector.length) {
				selectorstring = selectorstring + "<option>"
						+ unitselector[i].name + "</option>";
				i = i + 1;
			}
			selectorstring = selectorstring + "</select>";
		}
		
		if(that.options.label){
			$(this.element).append(
					"<p><label for='" + cssprop + "'>" + cssprop
							+ "</label><input class='sliderpreval' type=text name='"
							+ cssprop + "'></input>"
							+ selectorstring + "</p>");
		}else{
			$(this.element).append(
					"<input class='sliderpreval' type=text name='"
							+ cssprop + "'></input>"
							+ selectorstring + "<br />");
		}
		$(this.element)
				.append(
						"<input type='text' class='minunit minmax'/><div class='cssslider'></div><input type='text' class='maxunit minmax'/>");
		var theslider = $(this.element).children(".cssslider");
		var theinput = $(this.element).find(
				"[name=" + cssprop + "]");
		var theunitselector = $(this.element).find(
				'.unitselector');
		var theminunit = $(this.element).find('input.minunit');
		var themaxunit = $(this.element).find('input.maxunit');

		theminunit.val(that.options.min);
		themaxunit.val(that.options.max);

		function sliderchange() {
			var min = parseInt(theminunit.val(), 10);
			var max = parseInt(themaxunit.val(), 10);
			var different = max - min;
			var currentvalue = min
					+ different
					* (parseInt(theslider.slider('value'), 10) / 1000)
			var thetext = currentvalue + that.options.postfix;
			theinput.val(thetext);
			that._trigger('change', 0, thetext);
		}

		theminunit.change(sliderchange);
		themaxunit.change(sliderchange);

		theslider.slider($.extend({}, {
			max : 1000,
			min : 0,
			step : 0.1,
			change : sliderchange,
			slide : sliderchange
		}, this.options.sliderops));

		if (unitselector.length != 0) {
			theunitselector.change(function() {
				var thename = theunitselector.val();
				var i = 0;
				while (i < unitselector.length) {
					if (unitselector[i].name == thename) {
						that.postfix(unitselector[i].postfix,
								true);
						that._trigger('change', 0, that
								.string());
					}
					i = i + 1;
				}
			});
		}

		theinput.change(function() {
					var extractor = /(\d+)([^\s\d]*)/;
					var thetext = theinput.val();

					if (!extractor.test(thetext)) {
						that._trigger('change', 0, thetext);
						return;
					}

					var thepostfix = extractor.exec(thetext)[2];
					var thenumber = parseFloat(extractor
							.exec(thetext)[1]);

					that.postfix(thepostfix);
					var min = parseFloat(theminunit.val(), 10)
					var max = parseFloat(themaxunit.val(), 10)

					if (min > thenumber) {
						theminunit
								.val(parseFloat(thenumber, 10));
						var min = parseFloat(theminunit.val(),
								10)
					}
					if (max < thenumber) {
						themaxunit
								.val(parseFloat(thenumber, 10));
						var max = parseFloat(themaxunit.val(),
								10)
					}

					var different = max - min;
					var difval = parseFloat(thenumber)
							- parseFloat(min);
					var percentage = difval * 1000 / different

					theslider.slider('value', percentage);

				});

		if (this.options.registercss) {
			function changehandler(event, string) {
				if (that.options.cssprop != '') {
					modifycss(that.options.selector,that.options.cssprop, string
							.toString());
				}
			}

			if (!this.options.change) {
				this.options.change = changehandler;
			}

			function csshandler(csstring) {
				that.string(csstring);
			}

			registercsshandler(that.options.selector,cssprop, csshandler);
		}
	},
	postfix : function(newpostfix, nounit) {
		if (newpostfix == undefined) {
			return this.options.postfix;
		}

		if (this.options.nopostfixchange
				&& this.options.unitselector.length == 0) {
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

		var theslider = $(this.element).children(".cssslider");
		var theminunit = $(this.element).find('input.minunit');
		var themaxunit = $(this.element).find('input.maxunit');

		var min = parseFloat(theminunit.val(), 10)
		var max = parseFloat(themaxunit.val(), 10)

		this.options.postfix = newpostfix;
		var theinput = $(this.element).find(
				"[name=" + this.options.cssprop + "]");
		var thetext = ((max - min) * theslider.slider('value')
				/ 1000 + min)
				+ this.options.postfix;
		theinput.val(thetext);
		if (!nounit && this.options.unitselector.length != 0) {
			var theunitselector = $(this.element).find(
					'.unitselector');
			var unitselector = this.options.unitselector;
			var i = 0;
			while (i < unitselector.length) {
				if (unitselector[i].postfix == newpostfix) {
					theunitselector.val(unitselector[i].name);
				}
				i = i + 1;
			}
		}
	},
	string : function(newval) {
		if (newval == undefined) {
			return $(this.element).find(
					"[name=" + this.options.cssprop + "]")
					.val();
		}
		var extractor = /([\d.]+)([^\s\d.]*)/;
		var numbernopostfix= /^\s*[\d.]+\s*$/;
		
		var thepostfix;
		var thenumber;
		
		if(numbernopostfix.test(newval)){
			var number=parseFloat(newval,10);
			thepostfix=this.options.postfix;
			thenumber=number;
		}else{
			$(this.element).find(
					"[name=" + this.options.cssprop + "]").val(
					newval);
			if (!extractor.test(newval)) {
				return;
			}

			thepostfix = extractor.exec(newval)[2];
			thenumber = parseFloat(extractor.exec(newval)[1],10);
		}


		this.postfix(thepostfix);
		var theslider = $(this.element).children(".cssslider");
		var theminunit = $(this.element).find('input.minunit');
		var themaxunit = $(this.element).find('input.maxunit');

		var min = parseFloat(theminunit.val(), 10)
		var max = parseFloat(themaxunit.val(), 10)

		if (min > thenumber) {
			theminunit.val(parseFloat(thenumber, 10));
			var min = parseFloat(theminunit.val(), 10)
		}
		if (max < thenumber) {
			themaxunit.val(parseFloat(thenumber, 10));
			var max = parseFloat(themaxunit.val(), 10)
		}

		var different = max - min;
		var difval = parseFloat(thenumber) - parseFloat(min);
		var percentage = difval * 1000 / different

		theslider.slider('value', percentage);
	}
});

function radiobuilder(theval){
	function builder(selector,cssproperty,option){
		var values=theval;
		if(option && option.values){
			$.extend(values,option.values);
		}
		var uid=selector.replace(" ","_")+cssproperty.replace(" ","_");
		var container=$("<div id='"+uid+"' style='inline-block'>");
		for(var index in values){
			var value=values[index];
			var chid=uid+value.replace(" ","_");
			var radiobutton=$("<input></input>");
			radiobutton.attr("id",chid);
			radiobutton.attr("value",value);
			radiobutton.attr("type","radio");
			radiobutton.attr("name",cssproperty.replace(" ","_"));
			var label=$("<label>");
			label.text(value);
			label.attr("for",chid);
			container.append(radiobutton);
			container.append(label);
		}
		container.buttonset();
		container.find("input").change(function() {
			modifycss(selector,cssproperty, $(this).val());
		});
		function handler(csstring) {
			console.log("Radio change->" + cssproperty);
			var theinput=container.find("input[value="+csstring+"]");
			theinput.attr("checked", "checked");
			theinput.button("refresh");
		}
		registercsshandler(selector,cssproperty, handler);
		return container;
	}
	return builder;
}

var _counter=0;
function foursliderbuilder(defoption){
	function thebuilder(selector,css,prefoption){
		var option={
				min : 0,
				max : 100,
				unitselector : [ {
					name : "Percent",
					postfix : "%"
				}, {
					name : "Pixel",
					postfix : "px"
				} ]
		}
		$.extend(option,defoption,prefoption,{registercss:false});
		_counter+=1;
		var counter=_counter.toString();
		var container=$("<div>");
		var ul=$("<ul>");
		ul.append("<li><a href='#single_"+counter+"'>All</a></li>");
		if(!option.nodoubletab){
			ul.append("<li><a href='#double_"+counter+"'>Horizontal/Vertical</a></li>");
		}
		ul.append("<li><a href='#quad_"+counter+"'>Top/Right/Bottom/Left</a></li>");
		
		var labels={
				all:css+"-all",
				horizontal:css+"-horizontal",
				vertical:css+"-vertical",
				top:css+"-top",
				right:css+"-right",
				bottom:css+"-bottom",
				left:css+"-left"
		}
		$.extend(labels,option.labels);
		
		var topval="";
		var rightval="";
		var bottomval="";
		var leftval="";
		function reapply(){
			var thestring=topval+" "+rightval+" "+bottomval+" "+leftval;
			modifycss(selector, css,thestring )
		}
		
		var topslider=$("<div id='vertical_"+counter+"'>");
		var rightslider=$("<div id='vertical_"+counter+"'>");
		var bottomslider=$("<div id='vertical_"+counter+"'>");
		var leftslider=$("<div id='vertical_"+counter+"'>");
		var verticalslider=$("<div id='vertical_"+counter+"'>");
		var horizontalslider=$("<div id='horizontal_"+counter+"'>");
		var singleslider=$("<div id='single_"+counter+"'>");
		
		var singletab=$("<div id='single_"+counter+"' style='padding:1ex;'>");
		singletab.append(singleslider);
		var doubletab=$("<div id='double_"+counter+"' style='padding:1ex;'>");
		doubletab.append(verticalslider);
		doubletab.append(horizontalslider);
		var quadtab=$("<div id='quad_"+counter+"' style='padding:1ex;'>");
		quadtab.append(topslider);
		quadtab.append(rightslider);
		quadtab.append(bottomslider);
		quadtab.append(leftslider);
		
		container.append(ul);
		container.append(singletab);
		if(!option.nodoubletab){
			container.append(doubletab);
		}
		container.append(quadtab);
		container.tabs();
				
		function handler(text){
			numberlist = text.split(" ");
			if (numberlist.length == 0) {
				console.log("Error, someone call setstring with an empty string.");
				return;
			}
			if (numberlist.length == 1) {
				singleslider.StylerSlider("string",numberlist[0]);
				container.tabs('select', 0);
				return;
			}
			if (numberlist.length == 2) {
				verticalslider.StylerSlider("string",numberlist[0]);
				horizontalslider.StylerSlider("string",numberlist[1]);
				container.tabs('select', 1);
				return;
			}
			if (numberlist.length == 4) {
				topslider.StylerSlider("string",numberlist[0]);
				rightslider.StylerSlider("string",numberlist[1]);
				bottomslider.StylerSlider("string",numberlist[2]);
				leftslider.StylerSlider("string",numberlist[3]);
				container.tabs('select', 2);
				return;
			}
		}
		registercsshandler(selector, css, handler);
		
		topslider.StylerSlider($.extend({},{
			cssprop : labels.top,
			change : function(event, text) {
				topval=topslider.StylerSlider("string");
				reapply();
			}},option)
		);
		rightslider.StylerSlider($.extend({},{
			cssprop : labels.right,
			change : function(event, text) {
				rightval=rightslider.StylerSlider("string");
				reapply();
			}},option)
		);
		bottomslider.StylerSlider($.extend({},{
			cssprop : labels.bottom,
			change : function(event, text) {
				bottomval=bottomslider.StylerSlider("string");
				reapply();
			}},option)
		);
		leftslider.StylerSlider($.extend({},{
			cssprop : labels.left,
			change : function(event, text) {
				leftval=leftslider.StylerSlider("string");
				reapply();
			}},option)
		);
		
		verticalslider.StylerSlider($.extend({},{
			cssprop : labels.vertical,
			change : function(event, text) {
				topslider.StylerSlider('string', text);
				bottomslider.StylerSlider('string', text);
			}},option)
		);
		horizontalslider.StylerSlider($.extend({},{
			cssprop : labels.horizontal,
			change : function(event, text) {
				rightslider.StylerSlider('string', text);
				leftslider.StylerSlider('string', text);
			}},option)
		);
		
		singleslider.StylerSlider($.extend({},{
			cssprop : labels.all,
			change : function(event, text) {
				verticalslider.StylerSlider('string', text);
				horizontalslider.StylerSlider('string', text);
			}},option)
		);
		return container;
	}
	return thebuilder;
}

function selectionbuilder(values){
	function builder(selector,cssproperty){
		var container=$("<select>");
		for(var index in values){
			var value=values[index];
			container.append("<option>"+value+"</option>");
		}
		container.change(function() {
			modifycss(selector,cssproperty, $(this).val());
		});
		function handler(csstring) {
			container.val(csstring);
		}
		registercsshandler(selector,cssproperty, handler);
		return container;
	}
	return builder;
}

function defaultbuilder(selector,cssproperty){
	var theinput=$("<input class='default'>");
	$(theinput).change(function() {
		modifycss(selector,cssproperty, $(theinput).val());
	});
	function handler(csstring) {
		$(theinput).val(csstring);
	}
	registercsshandler(selector,cssproperty, handler);
	return theinput;
}
function checkbox(selector,cssproperty,options){
	var checkval=options.checked;
	var uncheckval=options.unchecked;
	var theinput=$("<input type='checkbox'>");
	$(theinput).change(function(){
		var togive;
		if(theinput.attr("checked")){
			togive=checkval;
		}else{
			togive=uncheckval;
		}
		modifycss(selector, cssproperty,togive);
	});
	function handler(csstring){
		if(csstring==checkval){
			theinput.attr("checked","checked");
		}else{
			theinput.attr("checked","");
		}
	}
	registercsshandler(selector, cssproperty, handler)
	return theinput;
}

function boxshadowbuilder(selector,cssprop,options){

	var container=$("<div class='ui-corner-all ui-widget-content' style='padding:1ex'>");
	var shadowoverall = $('<input></input>');
	var shadowcolorinput = $('<input></input>');
	var shadowhorizontaloffsetslider = $('<div>');
	var shadowverticaloffsetslider = $('<div>');
	var shadowblurdistanceslider = $('<div>');
	var shadowspreaddistanceslider = $('<div>');
	var shadowinsetcheckbox = $('<input type="checkbox">');	
	
	container.append("Overall shadow:")
	.append(shadowoverall)
	.append("<br />Color:")
	.append(shadowcolorinput)
	.append(shadowhorizontaloffsetslider)
	.append(shadowverticaloffsetslider)
	.append(shadowblurdistanceslider)
	.append(shadowspreaddistanceslider)
	.append("Inset:")
	.append(shadowinsetcheckbox);
	
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
		shadowcolorinput.ColorPickerSetColor(shadowcolor);

	}

	registercsshandler(selector,"box-shadow", shadowhandler);

	function shadow_changed(csstring) {
		modifycss(selector,'box-shadow', csstring);
	}

	function shadow_overall_changed() {
		var fullstring = shadow_inset + " " + shadow_horizontal_offset + " "
				+ shadow_vertical_offset + " " + shadow_blur_distance + " "
				+ shadow_spread_distance + " " + shadow_color;
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
	})

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
	})

	shadowverticaloffsetslider.StylerSlider({
		min : -30,
		max : 30,
		cssprop : 'shadow_vertical_offset',
		registercss : false,
		change : function(event, string) {
			shadow_vertical_offset_change(string);
		}
	})

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

	shadowcolorinput.ColorPicker({
		onShow : function(colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide : function(colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange : function(hsb, hex, rgb) {
			shadowcolorinput.css('backgroundColor', '#' + hex);
			shadowcolorinput.val('#' + hex);
			shadow_color_change('#' + hex);
		}
	});

	shadowcolorinput.change(function() {
		shadowcolorinput.css('backgroundColor', shadowcolorinput.val());
		shadow_color_change(shadowcolorinput.val());
	});
	
	return container;
}

function colourbuilder(selector,cssprop,options){
	var input=$("<input>");
	input.ColorPicker({
		onShow : function(colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide : function(colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange : function(hsb, hex, rgb) {
			input.css('backgroundColor', '#' + hex);
			input.val('#' + hex);
			modifycss(selector,cssprop, '#' + hex);
		}
	});
	function handler(csstring) {
		console.log("color picker change to->" + csstring);
		input.val(csstring);
		if (csstring != "transparent") {
			input.ColorPickerSetColor(csstring);
		}
		$(input).css("background-color", csstring);
	}

	registercsshandler(selector,cssprop, handler);

	input.change(function() {
		var csstring = input.val();
		input.ColorPickerSetColor(csstring);
		input.css('backgroundColor', csstring);
		modifycss(selector,cssprop, csstring);
	});
	
	return input;
}

function textshadowbuilder(selector,cssprop,option){
	
	var textshadowcolorinput = $('<input>');
	var textshadowhoffsetslider = $('<div>');
	var textshadowvoffsetslider = $('<div>');
	var textshadowblurslider = $('<div>');
	var container=$("<div class='ui-corner-all ui-widget-content' style='padding:1ex;'>");
	container.append("Text-shadow color:")
	.append(textshadowcolorinput)
	.append(textshadowhoffsetslider)
	.append(textshadowvoffsetslider)
	.append(textshadowblurslider );

	var text_shadow_h_offset = "0px";
	var text_shadow_v_offset = "0px";
	var text_shadow_blur = "0px";
	var text_shadow_color = "#000000";

	function reset_text_shadow() {
		var fullstring = text_shadow_h_offset + " " + text_shadow_v_offset + " "
				+ text_shadow_blur + " " + text_shadow_color;
		modifycss(selector,"text-shadow", fullstring);
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
		textshadowcolorinput.ColorPickerSetColor(shadowcolor);

	}

	registercsshandler(selector,'text-shadow', text_shadow_handler);

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

	textshadowcolorinput.ColorPicker({
		onShow : function(colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide : function(colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange : function(hsb, hex, rgb) {
			textshadowcolorinput.css('backgroundColor', '#' + hex);
			textshadowcolorinput.val('#' + hex);
			text_shadow_color = ('#' + hex);
			reset_text_shadow();
		}
	});

	textshadowcolorinput.change(function() {
		textshadowcolorinput.css('backgroundColor', textshadowcolorinput.val());
		text_shadow_color = (textshadowcolorinput.val());
		reset_text_shadow();
	});

	return container;
}

function backgroundrepeatbuilder(selector,cssprop,option){
	var container=$("<div>");
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
		modifycss(selector,'background-repeat', fullstring);
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
	registercsshandler(selector,'background-repeat', backgroundimagerepeathandler);

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

function backgroundurlbuilder(selector,cssproperty){
	var backgroundimageurlinput=$("<br /><input style='width:100%;'>");
	var extractor = /url\((.*)\)/;
	$(backgroundimageurlinput).change(function() {
		var theurl = backgroundimageurlinput.val();
		if (extractor.test(theurl)) {
		modifycss(selector,'background-image',theurl);
		} else {
		modifycss(selector,'background-image', "url(" + theurl + ")");
		}
	});
	function handler(csstring) {
		if (extractor.test(csstring)) {
			backgroundimageurlinput.val(extractor.exec(csstring)[1]);
		} else {
			backgroundimageurlinput.val(csstring);
		}
	}
	registercsshandler(selector,cssproperty, handler);
	return backgroundimageurlinput;
}

function sliderbuilder(defoption){
	function innerbuilder(selector,cssprop,option){
		var predefoption={
			cssprop : cssprop,
			selector : selector,
			registercss : true,
			label:false,
			unitselector : [ {
				name : "Percent",
				postfix : "%"
			}, {
				name : "Pixel",
				postfix : "px"
			} ]
		};
		var newoption=$.extend({},predefoption,defoption,option);
		var thediv=$("<span>");
		thediv.StylerSlider(newoption);
		return thediv;
	}
	return innerbuilder;
}

var predefcustomcss={
  "text":{type:"accordion",
	    "title":"Text",
	    "controls":[
	      {"css":"font-family"},
	      {"css":"font-size"},
	      {"css":"text-align"},
	      {"css":"font-style"},
	      {"css":"font-weight"},
	      {"css":"text-transform"}
	    ]
	 },
  "border":{type:"accordion",
	    "title":"Border",
	    "controls":[
	      {"css":"border-style"},
	      {"css":"border-color"},
	      {"css":"border-width"}
	    ]
	 }
};

var nolabel=["text"]

var predefbuilders={
		"border-color":colourbuilder,
		"border-width":foursliderbuilder({postfix:"px",min:0,max:20}),
		"border-style":selectionbuilder(["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset","inherit"]),
		"border-radius":foursliderbuilder({nodoubletab:true,labels:{all:"all",top:"top-left",right:"top-right",bottom:"bottom-right",left:"bottom-left"}}),
		"border-top-left-radius":sliderbuilder({min:0,max:100,postfix:"px"}),
		"border-top-right-radius":sliderbuilder({min:0,max:100,postfix:"px"}),
		"border-bottom-left-radius":sliderbuilder({min:0,max:100,postfix:"px"}),
		"border-bottom-right-radius":sliderbuilder({min:0,max:100,postfix:"px"}),
		"box-shadow":boxshadowbuilder,
		"background-color":colourbuilder,
		"background-image":backgroundurlbuilder,
		"background-repeat":backgroundrepeatbuilder,
		"color":colourbuilder,
		"margin":foursliderbuilder({postfix:"px"}),
		"margin-top":sliderbuilder({min:0,max:100,postfix:"px"}),
		"margin-right":sliderbuilder({min:0,max:100,postfix:"px"}),
		"margin-bottom":sliderbuilder({min:0,max:100,postfix:"px"}),
		"margin-left":sliderbuilder({min:0,max:100,postfix:"px"}),
		"padding":foursliderbuilder({postfix:"px"}),
		"padding-top":sliderbuilder({min:0,max:100,postfix:"px"}),
		"padding-right":sliderbuilder({min:0,max:100,postfix:"px"}),
		"padding-bottom":sliderbuilder({min:0,max:100,postfix:"px"}),
		"padding-left":sliderbuilder({min:0,max:100,postfix:"px"}),
		"width":sliderbuilder({min:0,max:100,postfix:"%"}),
		"height":sliderbuilder({min:0,max:100,postfix:"%"}),
		"opacity":sliderbuilder({min:0,max:1,postfix:"",nopostfixchange:true}),
		"font-family":selectionbuilder(["inherit","Impact, Charcoal, sans-serif","‘Palatino Linotype’, ‘Book Antiqua’, Palatino, serif","Tahoma, Geneva, sans-serif","Century Gothic, sans-serif","‘Lucida Sans Unicode’, ‘Lucida Grande’, sans-serif","‘Arial Black’, Gadget, sans-serif","‘Times New Roman’, Times, serif","‘Arial Narrow’, sans-serif","Verdana, Geneva, sans-serif","Copperplate Gothic Light, sans-serif","‘Lucida Console’, Monaco, monospace","Gill Sans / Gill Sans MT, sans-serif","‘Trebuchet MS’, Helvetica, sans-serif","‘Courier New’, Courier, monospace","Arial, Helvetica, sans-serif","Georgia, Serif","'Comic Sans MS', cursive, sans-serif","'Bookman Old Style', serif","Garamond, serif","Symbol, sans-serif","Webdings, sans-serif",	"Wingdings, 'Zapf Dingbats', sans-serif"]),
		"font-style":radiobuilder(["inherit","normal","italic","oblique"]),
		"font-variant":radiobuilder(["inherit","normal","small-caps"]),
		"font-weight":radiobuilder(["inherit","normal","bold","bolder","lighter"]),
		"font-size":sliderbuilder({min:0,max:150,postfix:"%"}),
		"text-align":radiobuilder(["inherit","left","center","right","justify"]),
		"text-decoration":radiobuilder(["inherit","none","underline","overline","line-through","blink"]),
		"text-indent" : sliderbuilder({min:0,max:300,postfix:"px"}),
		"text-transform" : radiobuilder(["inherit","none","capitalize","uppercase","lowercase"]),
		"text-shadow":textshadowbuilder
		};

var builders={
		"checkbox":checkbox,
		"color":colourbuilder,
		"slider":sliderbuilder({}),
		"fourslider":foursliderbuilder({}),
		"radio":radiobuilder({})
}
//------------------------end builders definition-----------------------------

var thehandlers = {};
var changelog = {};
var inactive = false;

var defaultvalues = {
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
	"margin-top" : "0",
	"margin-right" : "0",
	"margin-bottom" : "0",
	"margin-left" : "0",
	"padding" : "0",
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
}

function reset_all(){
	for(var selector in thehandlers){
		for(var css in thehandlers[selector]){
			for(var defcss in defaultvalues){
				if(css==defcss){
					thehandlers[selector][css](defaultvalues[defcss]);
				}
			}
		}
	}
}

function modifycss(selector, css, csstring, noview) {
	if (inactive && !noview) {
		return;
	}
	console.log("change " + css + " for "+selector+"->" + csstring);
	if (selector == '') {
		return;
	}
	if (selector != "" && !noview) {
		previewiframe.contents().find(selector).css(css, csstring);
		if(!changelog[selector]){
			changelog[selector] = {};
		}
		if (csstring == "" || csstring == {}) {
			changelog[selector][css] = 'delete';
		} else {
			changelog[selector][css] = csstring;
		}
	}
}

function applytocontrol(selector,css, csstring) {
	thehandlers[selector][css](csstring);
}

function registercsshandler(selector,css, thefunction) {
	if(!thehandlers[selector]){
		thehandlers[selector]={};
	}
	thehandlers[selector][css] = thefunction;
}

function ishandlerexist(selector,css){
	if(thehandlers[selector]){
		if(thehandlers[selector][css]){
			return true;
		}
	}
	return false;
}

// css parsing and dom manipulation

var mainbody=$("#mainbody");
var cssbase="";
var oldstyle = "";
var selectorDict = [];

function showOverlay() {
	// open the overlay--- shamelessly copying demo from jquery tool :-)
	$("#savingoverlay").overlay({

		// some mask tweaks suitable for facebox-looking dialogs
		mask : {

			// you might also consider a "transparent" color for the mask
			color : '#fff',

			// load mask a little faster
			loadSpeed : 500,

			// very transparent
			opacity : 0.5
		},

		// disable this for modal dialog-type of overlays
		closeOnClick : false,

		// load it immediately after the construction
		load : true

	});
}

function reverse_css(){
	for ( var selector in changelog) {
		var properties = changelog[selector];
		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {
				$(previewiframe).contents().find(selector).css(property,"");
			}
		}
	}
}

function getnewcss() {

	var preappend = "/*--CSS statement below is generated by Styler. Please do not remove this comment--*/";
	var newgenerated = preappend;
	var endappend = "\n/*--CSS statement above is generated by Styler. Please do not remove this comment--*/";
	var newstyle = oldstyle
	// new generetor.....................
	previewiframe.contents().find(".preview_container").toggleClass(
			"preview_container");
	var extractegenerated = /\/\*--CSS statement below is generated by Styler. Please do not remove this comment--\*\/([\s\S]*)/;
	var oldgenerated = extractegenerated.exec(oldstyle);

	var newfile = false;
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
			var csspropertygroupextractor = new RegExp(selector
					+ "[ ]*{[^{}]*}");
			var selectorgroup = csspropertygroupextractor
					.exec(generatedportion);
			if (selectorgroup) {
				var oldgroup = selectorgroup[0];
				var closednewgroup = selectorgroup[0];
				var newgroup = /([^}]*)}/.exec(closednewgroup)[1];

				var properties = changelog[selector];
				for ( var property in properties) {
					if (properties.hasOwnProperty(property)) {
						var propertytext = property + ":"
								+ properties[property] + ";";
						// find current property in current group.
						// if exist replace with new one
						// if not create it and append.
						var theregex = new RegExp("([\\s;]+)" + property
								+ " *:[^:;]*;");
						if (theregex.test(newgroup)) {
							var prefix = theregex.exec(newgroup)[1];
							newgroup = newgroup.replace(theregex, prefix
									+ propertytext);
						} else {
							newgroup = newgroup + propertytext;
						}
					}
				}

				newgroup = newgroup + "}";

				generatedportion = generatedportion.replace(oldgroup, newgroup);

			} else {
				var newgroup = selector + "{";
				var properties = changelog[selector];
				for ( var property in properties) {
					if (properties.hasOwnProperty(property)) {
						var propertytext = property + ":"
								+ properties[property] + ";";
						newgroup = newgroup + propertytext;
					}
				}
				newgroup = newgroup + "}";
				generatedportion = generatedportion + newgroup;
				// make new css group and put in the generated
			}

		}

		newstyle = newstyle.replace(oldvalue, preappend + generatedportion
				+ endappend);

	} else {
		for ( var selector in changelog) {
			var newgroup = selector + "{";
			var properties = changelog[selector];
			for ( var property in properties) {
				if (properties.hasOwnProperty(property)) {
					var propertytext = property + ":" + properties[property]
							+ ";";
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

function savestyle() {
	oldstyle = getnewcss();
	reverse_css();
	parent.applyStyle(oldstyle);
}

$('#savebutton').click(function() {
	savestyle();
});

function extract_properties() {
	inactive = true;
	//first exclude the comment.
	var commentfinder=/\/\*[\s\S]*?\*\//mg;
	var nocomment=cssbase+oldstyle.replace(commentfinder,"\n");
	//then find it
	var propertyextracter = new RegExp( "\s*([^}]+)\s*{([^{}]*)}", 'mg');
	var match;
	while(match=propertyextracter.exec(nocomment)){
		var selector=$.trim(match[1]);
		var properties=match[2];
		var propertyextracter2g = /([^:;]+):([^:;]*)\;/g;
		var propmatch;
		while(propmatch=propertyextracter2g.exec(properties)){
			var css=$.trim(propmatch[1]);
			var value=$.trim(propmatch[2]);
			if(ishandlerexist(selector, css)){
				applytocontrol(selector, css,value);
			}
		}
		
	}
	
	inactive = false;
}

function buildcontrol(property,defaultprop){
	if(property.type=="group"){
		var group=$("<div class='styler_group'>");
		var innerdefprop=$.extend({},defaultprop,property.defaultprop);
		if(property.title){
			group.append("<h3>"+property.title+"</h3>")
		}
		var controls=property.controls;
		for(var index in controls){
		  group.append(buildcontrol(controls[index],innerdefprop));
		}
		return group;
	}else if(property.type=="accordion"){
		var group=$("<div class='styler_accordian_group'>");
		var controls=property.controls;
		var title;
		if(property.title){
		  title=property.title;
		}else{
		  title="no-title";
		}
		var innerdefprop=$.extend({},defaultprop,property.defaultprop);
		var header=$("<h3><a href='#'>"+title+"</a></h3>");
		var content=$("<div class='cont'></div>");
		for(var index in controls){
		  $(content).append(buildcontrol(controls[index],innerdefprop));
		}
		group.append(header);
		group.append(content);
		$(group).accordion({
		  active:false,
		  autoHeight:false,
		  header:"h3",
		  collapsible:true
		});
		return group;
	}else{
		if(!property.name){
			property.name=property.css;
		}
		if(defaultprop){
			property=$.extend({},defaultprop,property);
		}
		if(!property.selector | !property.css){
			console.log("Minimum control component is not given.")
			return;
		}
		var selector=property.selector;
		var name=property.name;
		var css=property.css;
		var thecontainer=$("<div class='styler_control'>");
		if(nolabel.indexOf(css)==-1){
		    if(property.container=="accordion"){
			thecontainer.append("<h3><a href='#'>"+name+"</a></h3>");
		    }else{
			thecontainer.append("<span>"+name+" : </span><br />");
		    }
		}
		if(property.builder){
			thecontainer.append(builders[property.builder](selector,css,property.option));
		}else{
			if(predefbuilders[property.css]){
				thecontainer.append(predefbuilders[property.css](selector,css,property.option));
			}else if(predefcustomcss[property.css]){
				thecontainer.append(buildcontrol(predefcustomcss[property.css],property));
			}else{
				thecontainer.append(defaultbuilder(selector,css,property.option));
			}
		}
		if(property.container=="accordion"){
			$(thecontainer).accordion({
			    active:false,
			    autoHeight:false,
			    header:"h3",
			    collapsible:true
			});
		}
		return thecontainer;
	}
}

function buildlayout(thestringlayout){
	try{
		var layout=JSON.parse(thestringlayout);
	}catch(e){
		console.log("Invalid layout->"+e.toString());
		mainbody.append("<h4>Invalid layout->"+e.toString()+"</h4>");
		return;
	}
	var tabmenu=$("<ul>");
	for( page in layout){
		var newid="tab-"+page.replace(" ","_");
		var thediv=$("<div id='"+newid+"'></div>");
		tabmenu.append("<li><a href='#"+newid+"'>"+page+"</a></li>");
		var properties=layout[page];
		for( property in properties){
			thediv.append(buildcontrol(properties[property]));
		}
		mainbody.append(thediv);
	}
	mainbody.prepend(tabmenu);
	$(mainbody).tabs();
}

function parseOldStyle() {
	inactive = true;
	
	var layoutfinder=/\/\*\s*layout\s*\n([^*]*)\n\*\//mg;
	var matches;
	var counter=0;
	while(matches = layoutfinder.exec(oldstyle)){
		buildlayout(matches[1]);
		counter=counter+1;
	}
	reset_all();
	cssbase="";
	extract_properties();
	
	if(counter==0){
		
	}
	
	inactive = false;
}

var previewiframe;

function parseCSS(css, iframe) {
	mainbody.empty();
	mainbody.append()
	oldstyle = css;
	previewiframe = iframe;
	parseOldStyle();
}
