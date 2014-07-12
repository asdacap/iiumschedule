/*
Copyright (C) 2014 Muhd Amirul Ashraf bin Mohd Fauzi <asdacap@gmail.com>

This file is part of Automatic IIUM Schedule Formatter.

Automatic IIUM Schedule Formatter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Automatic IIUM Schedule Formatter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Automatic IIUM Schedule Formatter.  If not, see <http://www.gnu.org/licenses/>.
*/

$(function(){

  /* set functions and constant */

  function makearray(length) {
    var thearray = [];
    var i = 0;
    while (i < length) {
      thearray.push("");
      i = i + 1;
    }
    return thearray;
  }

  //convert data gathered from crs into data that can be used by template

  var ScheduleState = Backbone.Model.extend({

    render: function(){
      var template_data = this.convert_data(this.get("data"));
      template_data.style = this.get("style");
      template_data.settings = this.get("settings").attributes;

      var result = (new EJS({
        text : this.get("template"),
      })).render(template_data);
      return result;
    },

    convert_data: function(data){
      var studentname = data.studentname;
      var coursearray = data.coursearray;

      var starthour = 8;
      var actualstarthour = 20;
      var actualendhour = 8;
      var i = 0;
      while(i<coursearray.length){
        var i2 = 0;
        var ccourse = coursearray[i];
        while(i2<ccourse.schedule.length){
          var sched = ccourse.schedule[i2];
          var start = Math.floor(sched.start);
          if(start<actualstarthour){
            actualstarthour = start;
          }
          var end = Math.floor(sched.end);
          if(sched.end>end){
            end += 1;
          }
          if(end>actualendhour){
            actualendhour = end;
          }
          i2 = i2+1;
        }
        i = i+1;
      }

      var startfminute = actualstarthour*12;
      var endfminute = actualendhour*12;

      var hournum = 14;
      var actualhournum = actualendhour-actualstarthour;
      var fiveminutenum = actualhournum*12;


      var byday = {
        MON : makearray(hournum),
        TUE : makearray(hournum),
        WED : makearray(hournum),
        THUR : makearray(hournum),
        FRI : makearray(hournum),
        SAT : makearray(hournum),
        SUN : makearray(hournum)
      };

      var scaledbyday = {
        MON : makearray(actualhournum),
        TUE : makearray(actualhournum),
        WED : makearray(actualhournum),
        THUR : makearray(actualhournum),
        FRI : makearray(actualhournum),
        SAT : makearray(actualhournum),
        SUN : makearray(actualhournum)
      };

      var byfiveminute = {
        MON : makearray(fiveminutenum),
        TUE : makearray(fiveminutenum),
        WED : makearray(fiveminutenum),
        THUR : makearray(fiveminutenum),
        FRI : makearray(fiveminutenum),
        SAT : makearray(fiveminutenum),
        SUN : makearray(fiveminutenum)
      };

      var ci = 0;
      while (ci < coursearray.length) {
        var course = coursearray[ci];
        var si = 0;
        while (si < course.schedule.length) {
          var schedule = course.schedule[si];
          var start = schedule.start;
          var end = schedule.end;
          var starth = Math.floor(start);
          var startm = start-starth;
          startm = Math.round(startm*100/5);
          startm = startm+starth*12;
          var endh = Math.floor(end);
          var endm = end-endh;
          endm = Math.round(endm*100/5);
          endm = endm+endh*12;

          var durationh = endh - starth;
          byday[schedule.day][starth - starthour] = {
            course : course,
            duration : durationh,
            venue : course.schedule[si].venue
          };

          scaledbyday[schedule.day][starth - actualstarthour] = {
            course : course,
            duration : durationh,
            venue : course.schedule[si].venue
          };

          var i = 1;
          while (i < durationh) {
            byday[schedule.day][start - starthour + i] = "none";
            scaledbyday[schedule.day][start - actualstarthour + i] = "none";
            i = i + 1;
          }

          var durationm = endm - startm;
          byfiveminute[schedule.day][startm - startfminute] = {
            course : course,
            duration : durationm,
            venue : course.schedule[si].venue
          };

          i = 1;
          while(i<durationm){
            byfiveminute[schedule.day][startm - startfminute + i] = "none";
            i = i+1;
          }

          si = si + 1;
        }

        ci = ci + 1;
      }

      var thedata = {
        studentname : studentname,
        schedule : byday,
        scaledday : scaledbyday,
        byfiveminute : byfiveminute,
        actualstarthour : actualstarthour,
        actualendhour : actualendhour,
        courselist : coursearray,
        matricnumber : data.matricnumber,
        ic : data.ic,
        session : data.session,
        semester : data.semester,
        program : data.program
      };
      return thedata;
    }

  });

  var ScheduleSetting = Backbone.Model.extend({
  });

  var View = Backbone.View.extend({
    render: function(){
      var data = this.data;
      if(_.isFunction(data)){
        data = this.data();
      }
      this.$el.html(this.template(data));
      if(this.afterRender){
        this.afterRender();
      }
    },
    data: function(){
      return this.model;
    },
    initialize: function(){
      this.render();
    }
  });

  var EditTemplateView = View.extend({
    template: _.template($('#edittemplate_template').html()),
    events: {
      'click .save_button':'save'
    },
    save: function(){
      var theval=this.$el.find('textarea.content').val();
      this.model.set('template',this.$el.find('textarea.content').val());
    }
  });

  var EditCSSView = View.extend({
    template: _.template($('#editstyle_template').html()),
    events: {
      'click .save_button':'save'
    },
    save: function(){
      this.model.set('style',this.$el.find('textarea.content').val());
    }
  });

  var SettingView = View.extend({
    template: _.template($('#setting_template').html()),
    afterRender: function(){
      var self=this;
      _.each(this.model.get('settings').get('show_day'),function(value,key){
        self.$el.find('input[type=checkbox][name="show_day.'+key+'"]').prop('checked',value);
      });
      _.each(['showpersonalinfo','showcoursetable','showfulldayname','fixminutealign'],function(value,key){
        self.$el.find('input[type=checkbox][name='+value+']').prop('checked',self.model.get('settings').get(value));
      });
      _.each(self.model.get('settings').get('coursetable'),function(value,key){
        self.$el.find('input[type=checkbox][name="coursetable.'+key+'"]').prop('checked',value);
      });
    },
    events: {
      'change [type=checkbox]':'setSetting'
    },
    setSetting: function(){
      var self=this;
      _.each(self.model.get('settings').get('show_day'),function(value,key){
        self.model.get('settings').get('show_day')[key]=self.$el.find('input[type=checkbox][name="show_day.'+key+'"]').is(':checked');
      });
      _.each(['showpersonalinfo','showcoursetable','showfulldayname','fixminutealign'],function(value,key){
        self.model.get('settings').set(value,self.$el.find('input[type=checkbox][name='+value+']').is(':checked'));
      });
      _.each(self.model.get('settings').get('coursetable'),function(value,key){
        self.model.get('settings').get('coursetable')[key]=self.$el.find('input[type=checkbox][name="coursetable.'+key+'"]').is(':checked');
      });
      self.model.trigger('change');
    }
  });

  var AppRouter = Backbone.Router.extend({
    routes: {
      "" : "index",
      "theme": "loadThemes",
      "setting": "loadSettings",
      "styler": "loadStyler",
      "css": "loadCSS",
      "template": "loadTemplateSetting"
    },
    el: $("#configpane"),
    loadView: function(view){
      if(this.currentView) this.currentView.remove();
      this.currentView = view;
      this.el.append(this.currentView.$el);
    },

    index: function(){
      console.log("index");
    },
    loadThemes: function(){
      console.log("On load themes");
    },
    loadSettings: function(){
      this.loadView(new SettingView({ model:current_state }));
    },
    loadStyler: function(){
      console.log("On load styler");
    },
    loadCSS: function(){
      this.loadView(new EditCSSView({ model:current_state }));
    },
    loadTemplateSetting: function(){
      this.loadView(new EditTemplateView({ model:current_state }));
    }
  });

  var DAY_NAME = {
    MON:'monday',
    TUE:'tuesday',
    WED:'wednesday',
    THUR:'thursday',
    FRI:'friday',
    SAT:'saturday',
    SUN:'sunday'
  };

  var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
  };

  var generate_token = function() {
    return rand() + rand(); // to make it longer
  };

  function rerender(style) {
    var theiframe = $('#previewiframe');
    theiframe.contents().find('html').html(current_state.render());
  }

  /* end set functions and constand */

  /* all are page functions */
  function changetemplatepage() {
    postpage();
    $('#configiframe').bind('load',function() {
      document.getElementById('configiframe').contentWindow.changetemplate(getcurrenttemplate());
      $('#configiframe').unbind("load");
      postpage = function() {
      };
    });
    $("#configiframe").attr("src", "/static/templateeditor.html");
  }

  function themegallery() {
    postpage();
    $('#configiframe').bind('load', function() {
      $('#configiframe').unbind("load");
      postpage = function() {
      };
    });
    $("#configiframe").attr("src", "/themegallery");
  }

  function settingspage(){
    postpage();
    postpage = function(){};
    $("#configiframe").attr("src", "/static/settings.html");
  }

  function manualcsspage() {
    postpage();
    $('#configiframe').bind('load',function() {
      document.getElementById('configiframe').contentWindow.changeStyle(getcurrentstyle());
      $('#configiframe').unbind("load");
      postpage = function(){};
    });
    $("#configiframe").attr("src", "/static/csseditor.html");
  }

  function stylercsspage() {
    postpage();
    $('#configiframe').bind('load',function() {
      var thewindow = document.getElementById('configiframe').contentWindow;
      thewindow.parseCSS(getcurrentstyle(), $('#previewiframe'));
      $('#configiframe').unbind("load");
      postpage = function() {
        document.getElementById('configiframe').contentWindow.savestyle();
      };
    });
    $("#configiframe").attr("src", "/static/styler.html");
  }

  /* end page functions */

  //Save it
  function saveStyle() {
    console.log("Saving Style");
    var theiframe = $('#previewiframe');
    var data = theiframe.contents().find('html').html();
    console.log("Posting schedule");
    $.post(window.location.origin + "/scheduleformatter/", {
      data : data,
      custom : 1,
      no_post_process : 1,
      ctoken : ctoken
    }, function(response) {
      console.log("Schedule posted");
    });
  }

  /* initialization */
  var ctoken = generate_token();
  $("#savebutton a").attr("href", "/scheduleloader?ctoken=" + ctoken);
  $("#savebutton a").click(saveStyle);

  // Make the clicked button stay selected
  $("#tabmenulist td > a").click(function(){
    var thetd = $(this).parent();
    if(thetd.attr("id") == "savebutton"){
      return;
    }
    $("#tabmenulist td.selected").toggleClass("selected");
    thetd.addClass("selected");
  });

  //Not sure what this does
  if (!window.location.origin) {
    window.location.origin = window.location.protocol +
      "//" +
      window.location.host;
  }

  //current state store the current state
  var current_state = new ScheduleState({
    template: $("#scheduletemplate").html(),
    data: window.data,
    style: "",
    settings: new ScheduleSetting({
      show_day:{
        MON:true,
        TUE:true,
        WED:true,
        THUR:true,
        FRI:true,
        SAT:true,
        SUN:false
      },
      fixminutealign:true,
      showpersonalinfo:true,
      showcoursetable:true,
      showfulldayname:false,
      coursetable:{
        code:true,
        section:true,
        credit:true,
        name:true,
        lecturer:true
      }
    })
  });

  //fetch default template and style, then render it, then open theme gallery
  $.when( $.get("/static/default.html"), $.get("/static/default.css") ).done(function(template,css){
    current_state.set("template",template[0]);
    current_state.set("style",css[0]);
    rerender();
    current_state.on('change',rerender);
    //themegallery();
  });

  //The splitpane
  $(".split-pane").splitPane();

  var router = new AppRouter();
  Backbone.history.start({
  });


  /* copied from stachoverflow */

/*
  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
    // Get the absolute anchor href.
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    // Get the absolute root.
    var root = location.protocol + "//" + location.host + '/scheduleformatter/';

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      Backbone.history.navigate(href.attr, true);
    }
  });
  */

});
