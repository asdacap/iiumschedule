 
jQuery.widget('styler.fourslider',{
  
  options:{min:0,max:1000,initialstring:"0px",postfix:"px"},
  
  _create:function(){
     this.counter+=1;
     this.options._counter=this.counter;
     
     var singleslider='<div id="fourslider-'+this.options._counter+'-single"><p>'+
     '<label type="text" for="singleval">All:</label><input name="singleval"></input>'+
     '</p><div id="fourslider-'+this.options._counter+'-singleslider"></div></div>'
     
     var dualslider='<div id="fourslider-'+this.options._counter+'-dual">'+
     '<p><label type="text" for="horizontalval">Horizontal:</label><input name="horizontalval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-horizontalslider"></div><br />'+
     '<p><label type="text" for="verticalval">Vertical:</label><input name="verticalval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-verticalslider"></div></div>'
     
     var fourslider='<div id="fourslider-'+this.options._counter+'-four">'+
     '<p><label type="text" for="topval">Top:</label><input name="topval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-topslider"></div><br />'+
     '<p><label type="text" for="rightval">Right:</label><input name="rightval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-rightslider"></div><br />'+
     '<p><label type="text" for="bottomval">Bottom:</label><input name="bottomval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-bottomslider"></div></div>'+
     '<p><label type="text" for="leftval">Left:</label><input name="leftval"></input></p>'+
     '<div id="fourslider-'+this.options._counter+'-leftslider"></div><br />'+
     ''
     
     $(this.element).append(
       "<div class='fourslider'>"+
       "<ul>"+
       "<li><a href='#div-"+this.counter.toString()+"-1'>All</a></li>"+
       "<li><a href='#div-"+this.counter.toString()+"-2'>Horizontal/Verticle</a></li>"+
       "<li><a href='#div-"+this.counter.toString()+"-3'>Top/Bottom/Left/Right</a></li>"+
       "</ul>"+
       "<div id='div-"+this.counter.toString()+"-1'>"+singleslider+"</div>"+
       "<div id='div-"+this.counter.toString()+"-2'>"+dualslider+"</div>"+
       "<div id='div-"+this.counter.toString()+"-3'>"+fourslider+"</div>"+
       "</div>"
    );
     
    var anotherthis=this;
    $(this.element).children('.fourslider').tabs({select:function(event,ui){
	anotherthis._trigger("change",0,anotherthis.string())
    }});
    
    var themin=this.options.min;
    var themax=this.options.max;
    
    function addslider(parentobj,text,counter){
		var theel=parentobj.element;
		var theslider=$(theel).find("#fourslider-"+counter+"-"+text+"slider");
		theslider.slider({
			min: themin,
			max: themax,
			slide: function( event, ui ) {
				$(theel).find("[name="+text+"val]" ).val(ui.value );
				parentobj._trigger("change",0,parentobj.string())
			}
		});
		var theinput=$(theel).find("[name="+text+"val]" );
		theinput.val($(theel).find("#fourslider-"+counter+"-"+text+"slider").slider( "value" ) );
		theinput.change(function(){
		      theslider.slider('value',($(this).val()));
		      parentobj._trigger("change",0,parentobj.string());
		});
		
    }
    
    addslider(this,"single",this.options._counter);
    addslider(this,"horizontal",this.options._counter);
    addslider(this,"vertical",this.options._counter);
    addslider(this,"left",this.options._counter);
    addslider(this,"right",this.options._counter);
    addslider(this,"top",this.options._counter);
    addslider(this,"bottom",this.options._counter);
    
    this.string(this.options.initialstring);
    
  },
  counter:0,
  
  string:function(text){
    if(text==undefined){
      var postfix=this.options.postfix;
      var themode=this.mode();
      switch(themode){
	case 0:
	  return ""+
	  $(this.element).find('#fourslider-'+this.options._counter+'-singleslider').slider("option","value").toString()+postfix+"";
	  break;
	case 1:
	  return ""+
	  $(this.element).find('#fourslider-'+this.options._counter+'-verticalslider').slider("option","value").toString()+postfix+" "+
	  $(this.element).find('#fourslider-'+this.options._counter+'-horizontalslider').slider("option","value").toString()+postfix;
	  break;
	case 2:
	  return ""+
    $(this.element).find('#fourslider-'+this.options._counter+'-topslider').slider("option","value") +postfix+" "+
    $(this.element).find('#fourslider-'+this.options._counter+'-rightslider').slider("option","value") +postfix+" "+
    $(this.element).find('#fourslider-'+this.options._counter+'-bottomslider').slider("option","value") +postfix+" "+
    $(this.element).find('#fourslider-'+this.options._counter+'-leftslider').slider("option","value") +postfix;
	  break;
      }
    }
    
    
    numberlist=text.split(" ");
    if(numberlist.length==0){
      console.log("Error, someone call setstring with an empty string.");
      return;
    }
    if(numberlist.length==1){
      this.set_single(this.to_int_pixel(numberlist[0]));
      return;
    }
    if(numberlist.length==2){
      this.set_dual(this.to_int_pixel(numberlist[0]),this.to_int_pixel(numberlist[1]));
      return;
    }
    if(numberlist.length==4){
      this.set_all(this.to_int_pixel(numberlist[0]),this.to_int_pixel(numberlist[1]),this.to_int_pixel(numberlist[2]),this.to_int_pixel(numberlist[3]));
      return;
    }
    console.log("fourslider,Error, wrong text format given ->"+text);
  },
  
  to_int_pixel:function(string){
    var thenumber=parseInt(string,10);
    if(/\d+em/.test(string)){
      thenumber=thenumber*16;
    }
    if(/\d+ex/.test(string)){
      thenumber=thenumber*12;
    }
    return thenumber;
  },
  
  set_single:function(number){
    this.mode("single");
    $(this.element).find('#fourslider-'+this.options._counter+'-singleslider').slider("value",number);
    $(this.element).find('[name=singleval]').val(number);
    this._trigger("change",0,this.string())
  },
  
  set_dual:function(vertical,horizontal){
    this.mode("dual");
    $(this.element).find('#fourslider-'+this.options._counter+'-verticalslider').slider("value",vertical);
    $(this.element).find('[name=verticalval]').val(vertical);
    $(this.element).find('#fourslider-'+this.options._counter+'-horizontalslider').slider("value",horizontal);
    $(this.element).find('[name=horizontalval]').val(horizontal);
    this._trigger("change",0,this.string())
  },
  
  set_all:function(top,right,bottom,left){
    this.mode("all");
    $(this.element).find('#fourslider-'+this.options._counter+'-topslider').slider("value",top);
    $(this.element).find('[name=topval]').val(top);
    $(this.element).find('#fourslider-'+this.options._counter+'-rightslider').slider("value",right);
    $(this.element).find('[name=rightval]').val(right);
    $(this.element).find('#fourslider-'+this.options._counter+'-bottomslider').slider("value",bottom);
    $(this.element).find('[name=bottomval]').val(bottom);
    $(this.element).find('#fourslider-'+this.options._counter+'-leftslider').slider("value",left);
    $(this.element).find('[name=leftval]').val(left);
    this._trigger("change",0,this.string())
  },
  
  mode:function(modename){
    if(modename==undefined){
      return $(this.element).children('.fourslider').tabs('option','selected');
    }
    if(modename=="single"){
      $(this.element).children('.fourslider').tabs('select',0);
    }
    if(modename=="dual"){
      $(this.element).children('.fourslider').tabs('select',1);
    }
    if(modename=="all"){
      $(this.element).children('.fourslider').tabs('select',2);
    }
  },
  
  trigger_refresh:function(){
    this._trigger("change",0,this.string());
  }
  
});

$.widget('styler.StylerSlider',{
    options:{
     min:0,
     max:100,
     postfix:'px',
     nopostfixchange:false,
     cssprop:'',
     unitselector:[],
     registercss:true,
     sliderops:{}
    },
    _create:function(){
      var that=this;
      var cssprop=that.options.cssprop;
      var unitselector=that.options.unitselector;
      if(cssprop==''){
	throw 'cssprop must not be empty';
      }
      
      var selectorstring="";
      if(unitselector.length!=0){
	selectorstring="<select class='unitselector'>";
	var i=0;
	while(i<unitselector.length){
	  selectorstring=selectorstring+"<option>"+unitselector[i].name+"</option>";
	  i=i+1;
	}
	selectorstring=selectorstring+"</select>";
      }
      
      $(this.element).append("<p><label for='"+cssprop+"'>"+cssprop+"</label><input type=text name='"+cssprop+"'></input>"+selectorstring+"</p>");
      $(this.element).append("<input type='text' class='minunit minmax'/><div class='cssslider'></div><input type='text' class='maxunit minmax'/>");
      var theslider=$(this.element).children(".cssslider");
      var theinput=$(this.element).find("[name="+cssprop+"]");
      var theunitselector=$(this.element).find('.unitselector');
      var theminunit=$(this.element).find('input.minunit');      
      var themaxunit=$(this.element).find('input.maxunit');      
      
      theminunit.val(that.options.min);
      themaxunit.val(that.options.max);
      
      function sliderchange(){
	  var min=parseInt(theminunit.val(),10);
	  var max=parseInt(themaxunit.val(),10);
	  var different=max-min;
	  var currentvalue=min+different*(parseInt(theslider.slider('value'),10)/100)
	  var thetext=currentvalue+that.options.postfix;
	  theinput.val(thetext);
	  that._trigger('change',0,thetext);
      }
      
      theminunit.change(sliderchange);
      themaxunit.change(sliderchange);
      
      theslider.slider($.extend({},{
	max:100,
	min:0,
	step:0.1,
	change:sliderchange,
	slide:sliderchange
      },this.options.sliderops));
      
      if(unitselector.length!=0){
	theunitselector.change(function(){
	  var thename=theunitselector.val();
	  var i=0;
	  while(i<unitselector.length){
	    if(unitselector[i].name==thename){
	      that.postfix(unitselector[i].postfix,true);
	      that._trigger('change',0,that.string());
	    }
	    i=i+1;
	  }
	});
      }
      
      theinput.change(function(){
	var extractor=/(\d+)([^\s\d]*)/;
	var thetext=theinput.val();
	
	if(!extractor.test(thetext)){
	  that._trigger('change',0,thetext);
	  return;
	}
	
	var thepostfix=extractor.exec(thetext)[2];
	var thenumber=extractor.exec(thetext)[1];
      
	that.postfix(thepostfix);  
	var min=parseInt(theminunit.val(),10)
	var max=parseInt(themaxunit.val(),10)
	var different=max-min;
	var difval=parseFloat(thenumber)-parseFloat(min);
	var percentage=difval*100/different
	
	theslider.slider('value',percentage);
	
      });
      
      if(this.options.registercss){
	function changehandler(event,string){
	  if(that.options.cssprop!=''){
	    modifycss(that.options.cssprop,string.toString());
	  }
	}
	
	if(!this.options.change){
	  this.options.change=changehandler;
	}
	
	function csshandler(csstring){
	  that.string(csstring);
	}
	
	registercsshandler(cssprop,csshandler);
      }
    },
    postfix:function(newpostfix,nounit){
      if(newpostfix==undefined){
	return this.options.postfix;
      }
      
      if(this.options.nopostfixchange && this.options.unitselector.length==0){
	return;
      }
      if(this.options.nopostfixchange){
	var isok=false;
	var i=0;
	var unitselector=this.options.unitselector;
	while(i<unitselector.length){
	  if(unitselector[i].postfix==newpostfix){
	    isok=true;
	  }
	  i=i+1;
	}
	if(!isok){
	  return;
	}
      }
      
      this.options.postfix=newpostfix;
      var theinput=$(this.element).find("[name="+this.options.cssprop+"]");
      var theslider=$(this.element).children(".cssslider");
      var thetext=theslider.slider('value')+this.options.postfix;
      theinput.val(thetext);
      if(!nounit && this.options.unitselector.length!=0){
	var theunitselector=$(this.element).find('.unitselector');
	var unitselector=this.options.unitselector;
	var i=0;
	while(i<unitselector.length){
	    if(unitselector[i].postfix==newpostfix){
	      theunitselector.val(unitselector[i].name);
	    }
	    i=i+1;
	}
      }
    },
    string:function(newval){
      if(newval==undefined){
	return $(this.element).find("[name="+this.options.cssprop+"]").val();
      }
      var extractor=/([\d.]+)([^\s\d.]*)/;
      
      $(this.element).find("[name="+this.options.cssprop+"]").val(newval);
      if(!extractor.test(newval)){
	return;
      }
      
      var thepostfix=extractor.exec(newval)[2];
      var thenumber=parseInt(extractor.exec(newval)[1],10);
    
      this.postfix(thepostfix);
      var theslider=$(this.element).children(".cssslider");
      var theminunit=$(this.element).find('input.minunit');      
      var themaxunit=$(this.element).find('input.maxunit');      
      
      var min=parseInt(theminunit.val(),10)
      var max=parseInt(themaxunit.val(),10)
      var different=max-min;
      var difval=parseFloat(thenumber)-parseFloat(min);
      var percentage=difval*100/different
      
      theslider.slider('value',percentage);
    }
});

//css handling

    $('#control_pane').tabs();
    var preview_item='#preview_item';
    var current_selected='';
    var currentselector='';
    var changelog={};
    var inactive=false;
    
    var defaultvalues={
      "border-color":"transparent",
      "border-width":"0",
      "border-style":"none",
      "border-top-left-radius":"0px",
      "border-top-right-radius":"0px",
      "border-bottom-right-radius":"0px",
      "border-bottom-left-radius":"0px",
      "box-shadow":"0px 0px 0px 0px #000000",
      "background-color":"transparent",
      "background-image":"none",
      "background-repeat":"repeat",
      "margin-top":"0",
      "margin-right":"0",
      "margin-bottom":"0",
      "margin-left":"0",
      "padding":"0",
      "width":"auto",
      "height":"auto",
      "opacity":"1",
      "font-family":"inherit",
      "font-style":"normal",
      "font-variant":"normal",
      "font-weight":"normal",
      "font-size":"100%",
      "text-align":"left",
      "text-decoration":"none",
      "text-indent":"0px",
      "text-transform":"none",
      "text-shadow":"0px 0px 0px #000000"
    }
    
    function is_handler_exist(css){
      return defaultvalues.hasOwnProperty(css);
    }
    
    function resetall(){
      inactive=true;
      for(var key in defaultvalues){
	 applytocontrol(key,defaultvalues[key]);
	 modifycss(key,defaultvalues[key]);
      }
      recenter_item();
      inactive=false;
    }
    
    function modifycss(css,csstring,noview){
      $(preview_item).css(css,csstring);
      if(inactive && !noview){
	 return;
      }
      console.log("change "+css+" ->"+csstring);
      if(currentselector==''){return;}
      if(current_selected!="" && !noview){
	$(current_selected).css(css,csstring);
	if(csstring=="" || csstring=={}){
	  changelog[currentselector][css]='delete';
	}else{
	  changelog[currentselector][css]=csstring;
	}
      }
      recenter_item();
    }
    
    function applytocontrol(css,csstring){
      thehandlers[css](csstring);
    }
    
    var thehandlers={};
    
    function csstowidget(css,csstring){
      thehandlers[css](csstring);
    }
    
    function registercsshandler(css,thefunction){
      thehandlers[css]=thefunction;
    }
    
    function foursliderinputsetupv2(fourslider,initoption,input,cssname,optionalunit){
      
      function whenchange(csstring){
	modifycss(cssname,csstring);
      }
      
      fourslider.fourslider($.extend({},{change:function(ev,text){
	input.val(text);
	whenchange(input.val());
	}
      },initoption
      ));
      
      input.change(function(){
	fourslider.fourslider('string',$(input).val());
	whenchange($(input).val());
      });
      
      function handler(csstring){
	fourslider.fourslider('string',csstring);
	$(input).val(csstring);
      }
      registercsshandler(cssname,handler);
      
      $(optionalunit).change(function(){
	var postfix='px';
	if($(selectelem).val()=="Percent"){
	  postfix="%";
	}
	$(fourslider).fourslider('option','postfix',postfix);
	$(fourslider).fourslider('trigger_refresh');
      });
    }
    
    function colorsetup(input,cssprop){
      input.ColorPicker({
	  onShow: function (colpkr) {
		  $(colpkr).fadeIn(500);
		  return false;
	  },
	  onHide: function (colpkr) {
		  $(colpkr).fadeOut(500);
		  return false;
	  },
	  onChange: function (hsb, hex, rgb) {
		  input.css('backgroundColor', '#' + hex);
		  input.val('#' + hex);
		  modifycss(cssprop,'#' + hex);
	  }
      });
      function handler(csstring){
	input.val(csstring);
	input.ColorPickerSetColor(csstring);
      }
      
      registercsshandler(cssprop,handler);
      
      input.change(function(){
	var csstring=input.val();
	input.ColorPickerSetColor(csstring);
	input.css('backgroundColor',csstring);
	modifycss(cssprop,csstring);
      });
    }
    
    function setupinput(theinput,cssprop){
	$(theinput).change(function(){
	    modifycss(cssprop,$(theinput).val());
	});
	function handler(csstring){
	  $(theinput).val(csstring);
	}
	registercsshandler(cssprop,handler);
    }
    
    var theitem='#preview_container';
      
    function recenter_item(){
      $(theitem).css({
        position:'absolute',
        left: ($(theitem).parent().width() - $(theitem).outerWidth())/2,
        top: ($(theitem).parent().height() - $(theitem).outerHeight())/2
      });
    }
    
//Controls definition
    
    function border_color_change(csstring){
      modifycss('border-color',csstring);
    }
    
    var border_radius_horizontal="0px";
    var border_radius_vertical="0px";
    function reapply_border_radius(){
      var fullstring=border_radius_horizontal+"/"+border_radius_vertical;
      modifycss('border-radius',fullstring);
    }
    
    function border_radius_horizontal_change(csstring){
      border_radius_horizontal=csstring;
      reapply_border_radius();
    }
    
    function border_radius_vertical_change(csstring){
      border_radius_vertical=csstring;
      reapply_border_radius();
    }
    
    function borderradiushandler(csstring){
      var split=csstring.split('/');
      border_radius_horizontal=split[0];
      borderradiushorizontalfourslider.fourslider('string',split[0]);
      borderradiusverticalfourslider.fourslider('string',split[1]);
      borderradiushorizontalinput.val(split[0]);
      borderradiusverticalinput.val(split[1]);
    }
    
    var shadow_inset="";
    var shadow_color="#000";
    var shadow_horizontal_offset="0px";
    var shadow_vertical_offset="0px";
    var shadow_blur_distance="0px";
    var shadow_spread_distance="0px";
    
    function shadowhandler(csstring){
	var split=csstring.split(" ");
	var curindex=0;
	if(split[curindex].toLowerCase()=="inset"){
	  shadow_inset="inset";
	  shadowinsetcheckbox.attr("checked","checked");
	  curindex+=1;
	}
	var horizoff=split[curindex];
	curindex+=1;
	shadow_horizontal_offset=horizoff;
	shadowhorizontaloffsetslider.StylerSlider('string',horizoff);
	
	var vertoff=split[curindex];
	curindex+=1;
	shadow_vertical_offset=vertoff;
	shadowverticaloffsetslider.StylerSlider('string',vertoff);
	
	var endcolor=/#.*/;
	
	if(!endcolor.test(split[curindex])){
	  var shadowblur=split[curindex];
	  curindex+=1;
	  shadow_blur_distance=shadowblur;
	  shadowblurdistanceslider.StylerSlider('string',shadowblur);
	}
	
	if(!endcolor.test(split[curindex])){
	  var shadowspread=split[curindex];
	  curindex+=1;
	  shadow_spread_distance=shadowspread;
	  shadowspreaddistanceslider.StylerSlider('string',shadowspread);
	}
	
	var shadowcolor=split[curindex];
	shadowcolorinput.val(shadowcolor);
	shadowcolorinput.ColorPickerSetColor(shadowcolor);
	
    }
    
    registercsshandler('box-shadow',shadowhandler);
    
    function shadow_changed(csstring){
	modifycss('box-shadow',csstring);
    }
    
    function shadow_overall_changed(){
	var fullstring=shadow_inset+" "+shadow_horizontal_offset+" "+shadow_vertical_offset+" "+shadow_blur_distance+" "+shadow_spread_distance+" "+shadow_color;
	shadow_changed(fullstring);
	shadowoverall.val(fullstring);
    }
    
    function shadow_color_change(csstring){
	shadow_color=csstring;
	shadow_overall_changed();
    }
    
    function shadow_horizontal_offset_change(csstring){
	shadow_horizontal_offset=csstring;
	shadow_overall_changed();
    }
    
    function shadow_vertical_offset_change(csstring){
	shadow_vertical_offset=csstring;
	shadow_overall_changed();
    }
    
    function shadow_blur_distance_change(csstring){
	shadow_blur_distance=csstring;
	shadow_overall_changed();
    }
    
    function shadow_spread_distance_change(csstring){
	shadow_spread_distance=csstring;
	shadow_overall_changed();
    }
    
    function shadow_inset_change(csstring){
	shadow_inset=csstring;
	shadow_overall_changed();
    }
    
    function background_color_change(csstring){
	modifycss('background-color',csstring);
    }
    
    function background_image_url_change(csstring){
	modifycss('background-image',csstring);
    }
    
    var background_image_repeat_x="";
    var background_image_repeat_y="";
    function background_image_repeat_reload(){
	var repeatx=(background_image_repeat_x=="repeat-x");
	var repeaty=(background_image_repeat_y=="repeat-y");
	
	var fullstring="no-repeat";
	
	if(repeaty){
	  fullstring="repeat-y";
	}
	
	if(repeatx){
	  fullstring="repeat-x";
	}
	
	if(repeaty && repeatx){
	  fullstring="repeat";
	}
	modifycss('background-repeat',fullstring);
    }
    
    function backgroundimagerepeathandler(csstring){
	var trimmed=$.trim(csstring);
	if(trimmed=='no-repeat'){
	  background_image_repeat_x="";
	  background_image_repeat_y="";
	  backgroundimagerepeatx.prop('checked',false);
	  backgroundimagerepeaty.prop('checked',false);
	}
	if(trimmed=='repeat'){
	  background_image_repeat_x="repeat-x";
	  background_image_repeat_y="repeat-y";
	  backgroundimagerepeatx.prop('checked',true);
	  backgroundimagerepeaty.prop('checked',true);
	}
	if(trimmed=='repeat-x'){
	  background_image_repeat_x="repeat-x";
	  backgroundimagerepeatx.prop('checked',true);
	  background_image_repeat_y="";
	  backgroundimagerepeaty.prop('checked',false);
	}
	if(trimmed=='repeat-y'){
	  background_image_repeat_y="repeat-y";
	  backgroundimagerepeaty.prop('checked',true);
	  background_image_repeat_x="";
	  backgroundimagerepeatx.prop('checked',false);
	}
    }
    registercsshandler('background-repeat',backgroundimagerepeathandler);
    
    function background_image_repeat_x_change(csstring){
	background_image_repeat_x=csstring;
	background_image_repeat_reload();
    }
    
    function background_image_repeat_y_change(csstring){
	background_image_repeat_y=csstring;
	background_image_repeat_reload();
    }
    
    
    var borderfourslider=$('#border_width_fourslider');
    var borderwidthinput=$('[name=border_width]');
    
    var marginfourslider= $('#margin_fourslider');
    var marginsizeinput= $('[name=margin_size]');
    
    var margintop= $('#margin_top');
    var marginright= $('#margin_right');
    var marginbottom= $('#margin_bottom');
    var marginleft= $('#margin_left');
    var marginhorizontal= $('#margin_horizontal');
    var marginvertical= $('#margin_vertical');
    var marginall= $('#margin_all');
    
    var paddingfourslider=  $('#padding_fourslider');
    var paddingsizeinput= $('[name=padding_size]');
    
    var widthslider= $('#width_styler_slider');
    var heightslider= $('#height_styler_slider');
    
    var bordercolorinput=$('#border_color_input');
    
    var borderradiusall=$('#border_radius_all');
    var bordertopleftradius=$('#border_top_left_radius');
    var bordertoprightradius=$('#border_top_right_radius');
    var borderbottomrightradius=$('#border_bottom_right_radius');
    var borderbottomleftradius=$('#border_bottom_left_radius');
    var borderstyleselect=$('#border_style');
    
    var shadowcolorinput=$('[name=shadow_color]');
    var shadowhorizontaloffsetslider=$('#shadow_horizontal_offset_slider');
    var shadowverticaloffsetslider=$('#shadow_vertical_offset_slider');
    var shadowblurdistanceslider=$('#shadow_blur_distance_slider');
    var shadowspreaddistanceslider=$('#shadow_spread_distance_slider');
    var shadowinsetcheckbox=$('[name=shadow_inset]');
    
    var shadowoverall=$('[name=overall_shadow]');
    
    var backgroundcolorinput=$('input[name=background_color]');
    
    var backgroundimageurlinput=$('input[name=background_image_url]');
    var backgroundimagerepeatx=$('input[name=background_image_repeat_x]');
    var backgroundimagerepeaty=$('input[name=background_image_repeat_y]');
    var backgroundopacityslider=$('#background_opacity_slider');
    
    var foregroundcolorinput=$('input[name=foreground_color]');
    
    colorsetup(foregroundcolorinput,'color');
    
    //text shadow
    var textshadowhoffsetslider=$('#text_shadow_h_offset');
    var textshadowvoffsetslider=$('#text_shadow_v_offset');
    var textshadowblurslider=$('#text_shadow_blur');
    var textshadowcolorinput=$('[name=text_shadow_color]');
    
    var text_shadow_h_offset="0px";
    var text_shadow_v_offset="0px";
    var text_shadow_blur="0px";
    var text_shadow_color="#000000";
    
    function reset_text_shadow(){
      var fullstring=text_shadow_h_offset+" "+text_shadow_v_offset+" "+text_shadow_blur+" "+text_shadow_color;
      modifycss("text-shadow",fullstring);
    }
    
    function text_shadow_handler(csstring){
	var split=csstring.split(" ");
	var curindex=0;
	
	var horizoff=split[curindex];
	curindex+=1;
	text_shadow_h_offset=horizoff;
	textshadowhoffsetslider.StylerSlider('string',horizoff);
	
	var vertoff=split[curindex];
	curindex+=1;
	text_shadow_v_offset=vertoff;
	textshadowvoffsetslider.StylerSlider('string',vertoff);
	
	var endcolor=/#.*/;
	
	if(!endcolor.test(split[curindex])){
	  var shadowblur=split[curindex];
	  curindex+=1;
	  text_shadow_blur=shadowblur;
	  textshadowblurslider.StylerSlider('string',shadowblur);
	}
	
	var shadowcolor=split[curindex];
	textshadowcolorinput.val(shadowcolor);
	textshadowcolorinput.ColorPickerSetColor(shadowcolor);
      
    }
    
    registercsshandler('text-shadow',text_shadow_handler);
    
    textshadowhoffsetslider.StylerSlider({
      min:-50,
      max:50,
      nopostfixchange:true,
      cssprop:'text-shadow-hoffset',
      registercss:false,
      change:function(event,csstring){
	text_shadow_h_offset=csstring;
	reset_text_shadow();
      }
    });
    
    textshadowvoffsetslider.StylerSlider({
      min:-50,
      max:50,
      nopostfixchange:true,
      cssprop:'text-shadow-voffset',
      registercss:false,
      change:function(event,csstring){
	text_shadow_v_offset=csstring;
	reset_text_shadow();
      }
    });
    
    textshadowblurslider.StylerSlider({
      min:0,
      max:50,
      nopostfixchange:true,
      cssprop:'text-shadow-blur',
      registercss:false,
      change:function(event,csstring){
	text_shadow_blur=csstring;
	reset_text_shadow();
      }
    });
    
    textshadowcolorinput.ColorPicker({
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		textshadowcolorinput.css('backgroundColor', '#' + hex);
		textshadowcolorinput.val('#' + hex);
		text_shadow_color=('#' + hex);
		reset_text_shadow();
	}
    });    
    
    textshadowcolorinput.change(function(){
	textshadowcolorinput.css('backgroundColor', textshadowcolorinput.val());
	text_shadow_color=(textshadowcolorinput.val());
	reset_text_shadow();
    });
    
    //font control setup
    setupinput($('#font_family'),'font-family');
    setupinput($('#font_style'),'font-style');
    setupinput($('#font_variant'),'font-variant');
    setupinput($('#font_weight'),'font-weight');
    $('#font_size').StylerSlider({
      min:0,
      max:100,
      cssprop:'font-size',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"},{name:"Em",postfix:'em'},{name:"Ex",postfix:'ex'}]
    });
    
    //text control setup
    setupinput($('#text_align'),'text-align');
    setupinput($('#text_decoration'),'text-decoration');
    setupinput($('#text_transform'),'text-transform');
    $('#text_indent').StylerSlider({
      min:0,
      max:100,
      cssprop:'text-indent',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"},{name:"Em",postfix:'em'},{name:"Ex",postfix:'ex'}]
    });
    
    backgroundopacityslider.StylerSlider({
      min:0,
      max:1,
      sliderops:{step:0.01},
      cssprop:"opacity",
      postfix:"",
      nopostfixchange:true
    });
    
    backgroundimageurlinput.change(function(){
	var theurl=backgroundimageurlinput.val();
	background_image_url_change("url("+theurl+")");
    })
    
    function backgroundurlhandler(csstring){
	var extractor=/url\((.*)\)/;
	if(extractor.test(csstring)){
	  backgroundimageurlinput.val(extractor.exec(csstring)[1]);
	}else{
	  backgroundimageurlinput.val(csstring);
	}
    }
    registercsshandler('background-image',backgroundurlhandler);
    
    backgroundimagerepeatx.change(function(){
      if(backgroundimagerepeatx.attr("checked")){
	background_image_repeat_x_change("repeat-x");
      }else{
	background_image_repeat_x_change("");
      }
    });
    
    backgroundimagerepeaty.change(function(){
      if(backgroundimagerepeaty.attr("checked")){
	background_image_repeat_y_change("repeat-y");
      }else{
	background_image_repeat_y_change("");
      }
    });
    
    backgroundcolorinput.ColorPicker({
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		backgroundcolorinput.css('backgroundColor', '#' + hex);
		backgroundcolorinput.val('#' + hex);
		background_color_change('#' + hex);
	}
    });
    function backgroundcolorhandler(csstring){
      backgroundcolorinput.val(csstring);
      backgroundcolorinput.ColorPickerSetColor(csstring);
    }
    registercsshandler("background-color",backgroundcolorhandler);
    
    backgroundcolorinput.change(function(){
      var csstring=backgroundcolorinput.val();
      backgroundcolorinput.ColorPickerSetColor(csstring);
      backgroundcolorinput.css('backgroundColor',csstring);
      background_color_change(csstring);
    });
    
    
    shadowoverall.change(function(){
      shadow_changed(shadowoverall.val());
    })
    
    shadowinsetcheckbox.change(function(){
      if(shadowinsetcheckbox.attr("checked")){
	shadow_inset_change("inset");
      }else{
	shadow_inset_change("");
      }
    });
    
    shadowhorizontaloffsetslider.StylerSlider({
      min:-50,
      max:50,
      cssprop:'shadow_horizontal_offset',
      registercss:false,
      change:function(event,string){
	shadow_horizontal_offset_change(string);
      }
    })
    
    shadowverticaloffsetslider.StylerSlider({
      min:-50,
      max:50,
      cssprop:'shadow_vertical_offset',
      registercss:false,
      change:function(event,string){
	shadow_vertical_offset_change(string);
      }
    })
    
    shadowblurdistanceslider.StylerSlider({
      min:-50,
      max:50,
      cssprop:'shadow_blur_distance',
      registercss:false,
      change:function(event,string){
	shadow_blur_distance_change(string);
      }
    });
    
    shadowspreaddistanceslider.StylerSlider({
      min:-50,
      max:50,
      cssprop:'shadow_spread_distance',
      registercss:false,
      change:function(event,string){
	shadow_spread_distance_change(string);
      }
    });
    
    shadowcolorinput.ColorPicker({
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		shadowcolorinput.css('backgroundColor', '#' + hex);
		shadowcolorinput.val('#' + hex);
		shadow_color_change('#' + hex);
	}
    });    
    
    shadowcolorinput.change(function(){
	shadowcolorinput.css('backgroundColor', shadowcolorinput.val());
	shadow_color_change(shadowcolorinput.val());
    });
    
    //border radius setup
    
    $('#border_radius_tabs').tabs();
    
    borderradiusall.StylerSlider({
      min:0,
      max:100,
      registercss:false,
      change:function(event,string){
	  bordertopleftradius.StylerSlider('string',string);
	  borderbottomleftradius.StylerSlider('string',string);
	  bordertoprightradius.StylerSlider('string',string);
	  borderbottomrightradius.StylerSlider('string',string);
      },
      cssprop:'border-bottom-right-radius',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    })
    
    borderbottomrightradius.StylerSlider({
      min:0,
      max:100,
      cssprop:'border-bottom-right-radius',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    borderbottomleftradius.StylerSlider({
      min:0,
      max:100,
      cssprop:'border-bottom-left-radius',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    bordertoprightradius.StylerSlider({
      min:0,
      max:100,
      cssprop:'border-top-right-radius',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    bordertopleftradius.StylerSlider({
      min:0,
      max:100,
      cssprop:'border-top-left-radius',
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    //border setup
    
    setupinput(borderstyleselect,'border-style');
    
    bordercolorinput.ColorPicker({
	onShow: function (colpkr) {
		$(colpkr).fadeIn(500);
		return false;
	},
	onHide: function (colpkr) {
		$(colpkr).fadeOut(500);
		return false;
	},
	onChange: function (hsb, hex, rgb) {
		bordercolorinput.css('backgroundColor', '#' + hex);
		bordercolorinput.val('#' + hex);
		border_color_change('#' + hex);
	}
    });
    
    bordercolorinput.change(function(){
      bordercolorinput.ColorPickerSetColor(bordercolorinput.val());
      bordercolorinput.css('backgroundColor', bordercolorinput.val());
      border_color_change(bordercolorinput.val());
      
    });
    
    function bordercolorhandler(csstring){
      bordercolorinput.val(csstring);
      bordercolorinput.css('backgroundColor', bordercolorinput.val());
      bordercolorinput.ColorPickerSetColor(bordercolorinput.val());
    }
    registercsshandler('border-color',bordercolorhandler);
    
    foursliderinputsetupv2(borderfourslider,{max:30},borderwidthinput,'border-width');
    borderfourslider.fourslider('string',"1px");
    
    //margin setup
    
    $('#margin_controls').tabs();
    
    marginall.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-all",
      registercss:false,
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}],
      change:function(event,text){
	marginvertical.StylerSlider('string',text);
	marginhorizontal.StylerSlider('string',text);
      }
    });
    
    marginvertical.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-vertical",
      registercss:false,
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}],
      change:function(event,text){
	margintop.StylerSlider('string',text);
	marginbottom.StylerSlider('string',text);
      }
    });
    
    marginhorizontal.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-horizontal",
      registercss:false,
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}],
      change:function(event,text){
	marginleft.StylerSlider('string',text);
	marginright.StylerSlider('string',text);
      }
    });
    
    margintop.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-top", 
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    marginright.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-right", 
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    marginbottom.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-bottom", 
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    marginleft.StylerSlider({
      min:0,
      max:100,
      cssprop:"margin-left", 
      unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]
    });
    
    //padding setup
    
    foursliderinputsetupv2(paddingfourslider,{max:100},paddingsizeinput,'padding');
    
    //width /  height setup
    widthslider.StylerSlider({min:0,max:100,cssprop:'width',unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]})
    heightslider.StylerSlider({min:0,max:100,cssprop:'height',unitselector:[{name:"Percent",postfix:"%"},{name:"Pixel",postfix:"px"}]})
    
//css parsing and dom manipulation    
  
  var oldstyle="";
  var selectorDict=[];
  
  function showOverlay(){
    //open the overlay--- shamelessly copying demo from jquery tool :-)
    $("#savingoverlay").overlay({

	    // some mask tweaks suitable for facebox-looking dialogs
	    mask: {

		    // you might also consider a "transparent" color for the mask
		    color: '#fff',

		    // load mask a little faster
		    loadSpeed: 500,

		    // very transparent
		    opacity: 0.5
	    },

	    // disable this for modal dialog-type of overlays
	    closeOnClick: false,

	    // load it immediately after the construction
	    load: true

    });
  }
  
  function getnewcss(){
    
    var newstyle=oldstyle;
    
    //new generetor.....................
    previewiframe.contents().find(".preview_container").toggleClass("preview_container");
    var extractegenerated=/\/\*--CSS statement below is generated by Styler. Please do not remove this comment--\*\/[\s\S]*/;
    var oldgenerated=extractegenerated.exec(oldstyle);
    var newfile=false;
    if(oldgenerated){
      var generatedportion=oldgenerated[0];
      for(var selector in changelog){
	var csspropertygroupextractor=new RegExp(selector+"[ ]*{[^{}]*}");
	var selectorgroup=csspropertygroupextractor.exec(generatedportion);
	if(selectorgroup){
	  var oldgroup=selectorgroup[0];
	  var closednewgroup=selectorgroup[0];
	  var newgroup=/([^}]*)}/.exec(closednewgroup)[1];
	  
	  var properties=changelog[selector];
	  for( var property in properties){
	    if(properties.hasOwnProperty(property)){
	      var propertytext=property+":"+properties[property]+";";
	      //find current property in current group.
	      //if exist replace with new one
	      //if not create it and append.
	      var theregex=new RegExp("([\\s;]+)"+property+" *:[^:;]*;");
	      if(theregex.test(newgroup)){
		 var prefix=theregex.exec(newgroup)[1]; 
		 newgroup=newgroup.replace(theregex,prefix+propertytext);
	      }else{
		newgroup=newgroup+propertytext;
	      }
	    }
	  }
	  
	  newgroup=newgroup+"}";
	  
	  generatedportion=generatedportion.replace(oldgroup,newgroup);
	  
	}else{
	  var newgroup=selector+"{";
	  var properties=changelog[selector];
	  for( var property in properties){
	    if(properties.hasOwnProperty(property)){
	      var propertytext=property+":"+properties[property]+";";
	      newgroup=newgroup+propertytext;
	    }
	  }
	  newgroup=newgroup+"}";
	  generatedportion=generatedportion+newgroup;
	  //make new css group and put in the generated
	}
	
      }
      
      newstyle=newstyle.replace(oldgenerated[0],generatedportion);
      
    }else{
      var newgenerated="/*--CSS statement below is generated by Styler. Please do not remove this comment--*/\n";
      for(var selector in changelog){
	  var newgroup=selector+"{";
	  var properties=changelog[selector];
	  for( var property in properties){
	    if(properties.hasOwnProperty(property)){
	      var propertytext=property+":"+properties[property]+";";
	      newgroup=newgroup+propertytext;
	    }
	  }
	  newgroup=newgroup+"}";
	  newgenerated=newgenerated+newgroup;
	  //make new css group and put in the generated
      }
      newstyle=newstyle+newgenerated;
      
    }
    
    return newstyle;
  }
  
  function savestyle(){
    oldstyle=getnewcss();
    
    parent.applyStyle(oldstyle);
    
  }
  
  $('#savebutton').click(function(){
    savestyle();
  });
  
  function extract_and_reapplyproperty(selector){
    resetall();
    inactive=true;
    var propertyextractor=new RegExp(selector+"[ ]*{[^{}]*}",'g')
    var properties="";
    var matchs=oldstyle.match(propertyextractor);
    var i=0;
    propertyextractor=new RegExp(selector+"[ ]*{([^{}]*)}")
    while(matchs && i<matchs.length){
      if(propertyextractor.test(matchs[i])){
	var matching=propertyextractor.exec(matchs[i]);
	properties=properties+matching[1];
      }
      i=i+1;
    }
    propertyextractor=/[^:;]+:[^:;]*\;/g;
    matchs=properties.match(propertyextractor);
    propertyextractor=/([^:;]+):([^:;]*)\;/;
    if(matchs){
      i=0;
      while(i<matchs.length){
	var splitter=propertyextractor.exec(matchs[i]);
	var key=$.trim(splitter[1]);
	var value=$.trim(splitter[2]);
	if(is_handler_exist(key)){
	    applytocontrol(key,value);
	}
	i=i+1;
      }
    }
    
    var inchangelog=changelog[selector];
    for(var key in inchangelog){
      if(inchangelog.hasOwnProperty(key)){
	  applytocontrol(key,inchangelog[key]);
      }
    }
    inactive=false;
  }
  
  function changeselector(selector){
      previewiframe.contents().find(".preview_container").toggleClass("preview_container");
      current_selected=previewiframe.contents().find(selector);
      current_selected.toggleClass("preview_container")
      currentselector=selector;
      extract_and_reapplyproperty(selector);
  }
  
  var selectorselector=$('[name=selector_selector]');
  selectorselector.change(function(){
    var i=0;
    while(i<selectorDict.length){
      if(selectorDict[i].name==selectorselector.val()){
	if(!changelog.hasOwnProperty(selectorDict[i].selector)){
	  changelog[selectorDict[i].selector]={};
	}
	changeselector(selectorDict[i].selector);
	break;
      }
      i=i+1;	
    }
  });
  
  function parseOldStyle(){
    inactive=true;
    selector_selector={};
    var descriptorfinder=/\/\*[^*\/]+\*\//g;
    var matches;
    while(matches=descriptorfinder.exec(oldstyle)){
      var keyvaluematch=/"([^"=]+)"="([^"=]+)"/
      if(keyvaluematch.test(matches)){
	key=keyvaluematch.exec(matches)[1];
	value=keyvaluematch.exec(matches)[2];
	selectorDict.push({name:value,selector:key});
      }
    }
    
    selectorselector.empty();
    selectorselector.append("<option>Select an element to edit</option>")
    
    var i=0;
    while(i<selectorDict.length){
	selectorselector.append("<option>"+selectorDict[i].name+"</option>")
	i=i+1;
    }
    
    inactive=false;
  }
  
  var previewiframe;
  
  function parseCSS(css,iframe){
    oldstyle=css;
    previewiframe=iframe;
    parseOldStyle();
  }
