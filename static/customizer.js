if (!window.location.origin) {
	window.location.origin = window.location.protocol + "//"
			+ window.location.host;
}

var currenttemplate;
var parsed_data;
var currentsettings={
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
    showfulldayname:false
};
var day_name={
    MON:'monday',
    TUE:'tuesday',
    WED:'wednesday',
    THUR:'thursday',
    FRI:'friday',
    SAT:'saturday',
    SUN:'sunday'
};

function postpage() {
}

function togglealternate() {
	if ($("#previewiframe").hasClass("alternate")) {
		$("#expandbutton").text("Expand");
	} else {
		$("#expandbutton").text("Shrink");
	}
	$("#previewiframe").toggleClass("alternate");
	$("#configiframe").toggleClass("alternate");
}

var rand = function() {
	return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
	return rand() + rand(); // to make it longer
};

var ctoken = token();
$("#savebutton a").attr("href", "/scheduleloader?ctoken=" + ctoken);
$("#savebutton a").click(saveStyle);

function getcurrentstyle() {
	if (parsed_data.style == undefined) {
		var theiframe = $('#previewiframe');
		parsed_data.style = theiframe.contents().find("#thestyle").html();
	}
	return parsed_data.style;
}

function getcurrenttemplate() {
	if (currenttemplate != undefined) {
		return currenttemplate;
	}
	return $("#scheduletemplate").html();
}

function currentrendered() {
	var theiframe = $('#previewiframe')
	var thetext = theiframe.contents().find('html').html();
	return thetext;
}

function renderdata(data) {
    var cdata=data;
    if(cdata==undefined){
        cdata=parsed_data;
    }

    return (new EJS({
		text : currenttemplate,
	})).render(cdata);
}

function rerender(style) {
	if (style == undefined) {
		style = getcurrentstyle();
	}
	parsed_data.style = style;
	var thetext = renderdata(parsed_data);
	var theiframe = $('#previewiframe')

	theiframe.contents().find('html').html(thetext);
}

function changetemplatepage() {
	postpage();
	$('#configiframe').bind(
			'load',
			function() {
				document.getElementById('configiframe').contentWindow
						.changetemplate(getcurrenttemplate());
				$('#configiframe').unbind("load");
				postpage = function() {
				}
			});
	$("#configiframe").attr("src", "/static/templateeditor.html");
}

function themegallery() {
	postpage();
	$('#configiframe').bind('load', function() {
		$('#configiframe').unbind("load");
		postpage = function() {
		}
	});
	$("#configiframe").attr("src", "/themegallery");
}

function settingspage(){
    postpage();
    postpage=function(){}
	$("#configiframe").attr("src", "/static/settings.html");
}

function manualcsspage() {
	postpage();
	$('#configiframe').bind(
			'load',
			function() {
				document.getElementById('configiframe').contentWindow
						.changeStyle(getcurrentstyle());
				$('#configiframe').unbind("load");
				postpage = function() {
				}
			});
	$("#configiframe").attr("src", "/static/csseditor.html");
}

function stylercsspage() {
	postpage();
	$('#configiframe').bind(
			'load',
			function() {
				var thewindow=document.getElementById('configiframe').contentWindow;
				thewindow.parseCSS(
						getcurrentstyle(), $('#previewiframe'));
				$('#configiframe').unbind("load");
				postpage = function() {
					document.getElementById('configiframe').contentWindow
							.savestyle();
				}
			});
	$("#configiframe").attr("src", "/static/styler.html");
}

function applyStyle(thestyle) {
	rerender(thestyle);
}

function applyTemplate(template) {
	currenttemplate = template;
	rerender();
}

function saveStyle() {
	postpage();
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
	})

}

function makearray(length) {
	var thearray = new Array();
	var i = 0;
	while (i < length) {
		thearray.push("");
		i = i + 1;
	}
	return thearray;
}

//convert data gathered from crs into data that can be used by template
function convert_data(data){
	var studentname = data.studentname;
	var coursearray = data.coursearray;
	
    var starthour=8;
    var actualstarthour=20;
    var actualendhour=8;
    var i=0;
    while(i<coursearray.length){
        var i2=0;
        var ccourse=coursearray[i];
        while(i2<ccourse.schedule.length){
            var sched=ccourse.schedule[i2];
            var start=Math.floor(sched.start);
            if(start<actualstarthour){
                actualstarthour=start;
            }
            var end=Math.floor(sched.end);
            if(sched.end>end){
                end+=1;
            }
            if(end>actualendhour){
                actualendhour=end;
            }
            i2=i2+1;
        }
        i=i+1;
    }
    
    var startfminute=actualstarthour*12;
	var endfminute=actualendhour*12;

	var hournum=14;
    var actualhournum=actualendhour-actualstarthour;
    var fiveminutenum=actualhournum*12;


	var byday = {
		MON : makearray(hournum),
		TUE : makearray(hournum),
		WED : makearray(hournum),
		THUR : makearray(hournum),
		FRI : makearray(hournum),
		SAT : makearray(hournum),
		SUN : makearray(hournum)
	}

	var scaledbyday = {
		MON : makearray(actualhournum),
		TUE : makearray(actualhournum),
		WED : makearray(actualhournum),
		THUR : makearray(actualhournum),
		FRI : makearray(actualhournum),
		SAT : makearray(actualhournum),
		SUN : makearray(actualhournum)
	}

    var byfiveminute={
		MON : makearray(fiveminutenum),
		TUE : makearray(fiveminutenum),
		WED : makearray(fiveminutenum),
		THUR : makearray(fiveminutenum),
		FRI : makearray(fiveminutenum),
		SAT : makearray(fiveminutenum),
		SUN : makearray(fiveminutenum)
    }

	var ci = 0;
	while (ci < coursearray.length) {
		var course = coursearray[ci];
		var si = 0;
		while (si < course.schedule.length) {
			var schedule = course.schedule[si];
			var start = schedule.start;
			var end = schedule.end;
            var starth=Math.floor(start);
            var startm=start-starth;
            startm=Math.round(startm*100/5);
            startm=startm+starth*12;
            var endh=Math.floor(end);
            var endm=end-endh;
            endm=Math.round(endm*100/5);
            endm=endm+endh*12;

			var durationh = endh - starth;
			byday[schedule.day][starth - starthour] = {
				course : course,
				duration : durationh,
				venue : course.schedule[si].venue
			}
            scaledbyday[schedule.day][starth - actualstarthour] = {
				course : course,
				duration : durationh,
				venue : course.schedule[si].venue
			}

			var i = 1;
			while (i < durationh) {
				byday[schedule.day][start - starthour + i] = "none";
				scaledbyday[schedule.day][start - actualstarthour + i] = "none";
				i = i + 1;
			}

            var durationm = endm - startm;
            byfiveminute[schedule.day][startm - startfminute] ={
                course : course,
                duration : durationm,
                venue : course.schedule[si].venue
            }
            i = 1;
            while(i<durationm){
                byfiveminute[schedule.day][startm - startfminute + i] = "none";
                i=i+1;
            }

			si = si + 1;
		}

		ci = ci + 1;
	}

	function getScheduleText(course) {
		if (course == "") {
			return {
				text : ""
			};
		} else {
			return {
				text : course.name
			};
		}
	}

	function formatschedule() {
		var thereturn = new Array();
		for (key in byday) {
			thereturn.push({
				day : key,
				ischedule : getScheduleText(byday[key])
			});
		}
		return thereturn;
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
	}
    return thedata;
}

function formatschedule() {

    window.parsed_data=convert_data(data);
    parsed_data.settings=currentsettings;

	$.get("/static/default.html", function(data) {
		currenttemplate = data;
		$.get("/static/default.css", function(data) {
            parsed_data.style=data;
			rerender(data);
			//stylercsspage();
			themegallery();
		});
	});

}


$("#tabmenulist td > a").click(function(){
    var thetd=$(this).parent();
    if(thetd.attr("id")=="savebutton"){
        return;
    }
    $("#tabmenulist td.selected").toggleClass("selected");
    thetd.addClass("selected");
});
