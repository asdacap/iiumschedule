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

var defaultcolumnlength = 52;

function makearray(length) {
	var thearray = new Array();
	var i = 0;
	while (i < length) {
		thearray.push("");
		i = i + 1;
	}
	return thearray;
}

function makemessage(message, loading) {	
	console.log("Message ->"+message.toString());
	if (loading == undefined) {
		loading = true;
	}
	if (!$("#iiumschedulediv").length) {
		$("body")
				.append(
						"<div id='iiumschedulediv' style='width:100%;text-align:center;margin-top:10px;'></div>");
	}
	var poststring = "";
	if (loading) {
		poststring = "</br><img src='http://iiumschedule.asdacap.com/static/loading.gif'></img>";
	}
	$("#iiumschedulediv").html(message + poststring);
      
}

function fixstring(text) {
	console.log("Fix string->" + text);
	result = text
			.replace(
					/([\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})|./g,
					"$1");
	console.log("Result->" + result);
	return result
}

function error(e,vol){
	globerr=e;
	if(!$("#iiumschedulediv").length){
		$("body").append("<div id='iiumschedulediv' style='width:100%;text-align:center;margin-top:10px;'></div>");
	}
	var maindiv=$("#iiumschedulediv");
	maindiv.html("");
    if(vol!=undefined){
        maindiv.append("<h3>Reports...</h3>");
        maindiv.append("<p>Please click ok to continue <br /> WARNING: By default, this WILL include your CRS. To exclude your CRS, after you click ok, empty the section 'HTML Data'</p>");
    }else{
        maindiv.append("<h3>Error detected...</h3>");
        maindiv.append("<p>Sorry, an error occur. Would you be so kind to send me some data to help fix this bug? <br /> WARNING: this WILL include your CRS</p>");
    }
	var button=$("<button>Ok</button>");
	maindiv.append(button);
	maindiv.append("<span>(If not ok, just close this window)</span>");
	button.click(function(){
		var container=$("<div class='tempanimcont'>");
		maindiv.children().wrap(container);
		maindiv.find(".tempanimcont").slideUp(1000,function(){
			maindiv.find(".tempanimcont").remove();
		});
		var theform=$("<form>");
		theform.attr("method","POST");
		theform.attr("action","http://iiumschedule.asdacap.com/error/");
		theform.append("<label for='submitter'>Your Name</label><input type='text' name='submitter' value=''></input><br />");
		theform.append("<label for='add'>Anything else to add? Description maybe?</label><br /><textarea cols='30' rows='5' name='add'>Insert complain here</textarea><br />");
		theform.append("<label for='error'>Error Description</label><input type='text' name='error' value='"+e.toString()+"'></input><br />");
		theform.append("<label for='html'>HTML data</label><br /><textarea cols='30' rows='5' name='html'></textarea><br />");
		theform.find("textarea[name=html]").val($("body").html());
		theform.append("<input name='submit' type='submit' value='submit'></input>");
		maindiv.append(theform);
	});
}

function start(){
    if($("#TB_window iframe").length){
        //Inject in iframe
        $("#TB_window iframe")[0].contentWindow.eval("(function(){var e=document.createElement('script');e.src = 'http://iiumschedule.asdacap.com/static/scheduleformatter.js';e.type='text/javascript';e.addEventListener('load',function(){startscheduler()} );document.getElementsByTagName('head')[0].appendChild(e);})();");
    }else{
        try{
            parsetable();
        }catch(e){
            error(e);
        }
    }
}

function parsetable() {

    makemessage("Validating path");

    if(window.location.host=="prereg.iium.edu.my"){
        makemessage("<h3>Wrong Usage</h3>Please use the code on the CRS/Confirmation Slip page from MyIIUM, not from prereg slip.",false);
        return;
    }

    if(/^\/portal\/page\/portal\//.exec(window.location.pathname)){
        makemessage("<h3>Wrong Usage</h3>Please use the code on the CRS/<a target='_blank' href='/phpaps/run_rep_list.php?rep_key=confslip1&keepThis=true&TB_iframe=true&height=630&width=900'>Confirmation Slip</a> page.<br />Not on the main portal page.",false);
        return;
    }
    
    if($('form input[value=confslip1]').length){
        makemessage("<h3>Wrong Usage</h3>Please select a session first",false);
        return;
    }

    if(!$("body table").length || !$("body table").find('tr').length){
        makemessage("Error, no table found. Are you sure this is the schedule?<br>If you are, please <a href='javascript:error(\"Voluntary Error Report\",1)'>send an error report</a> so that I can fix thi.",false);
        return;
    }

    if($('body table').length!=1){
        makemessage("Error, page unrecognized. Are you sure this is the schedule?<br>If you are, please <a href='javascript:error(\"Voluntary Error Report\",1)'>send an error report</a> so that I can fix this.",false);
        return;
    }
	// parse table
	makemessage("Parsing table, please wait...");


    //old tablearray system kept for compatibility with CFS student.
	var tablearray = new Array();

	var rows = $("body table").find("tr");

    var maxcollength=0;
    rows.each(function(){
        var cur=0;
        $(this).find('td').each(function(){
            if($(this).attr('colspan')){
                cur+=parseInt($(this).attr('colspan'),10);
            }else{
                cur++;
            }
        });
        if(cur>maxcollength){
            maxcollength=cur;
        }
    });

    var columnlength=maxcollength;
    if(columnlength!=defaultcolumnlength){
        console.log('Warning! Different column length than default : '+columnlength);
    }

	var i = 0;
	while (i < rows.length) {
		tablearray.push(makearray(columnlength))
		i = i + 1;
	}

	rows.each(function(index, el) {
		var therow = $(this);

		var columns = therow.find("td");

		var ci = 0;
		columns.each(function() {
			var thecolumn = $(this);

			var colspan = 1;
			if (thecolumn.attr("colspan")) {
				colspan = parseInt(thecolumn.attr("colspan"), 10);
			}

			var rowspan = 1;
			if (thecolumn.attr("rowspan")) {
				rowspan = parseInt(thecolumn.attr("rowspan"), 10);
			}

			var cspi = 0;
			while (cspi < colspan) {
				var rspi = 0;
				while (rspi < rowspan) {
					if (cspi == 0 && rspi == 0) {
					} else {
						if (tablearray[index + rspi][ci + cspi] == "") {
							tablearray[index + rspi][ci + cspi] = "none"
						} else {
							console.log("warning, table array on rspi/cspi"
									+ (index + rspi).toString() + "/"
									+ (ci + cspi).toString()
									+ " is not empty->"
									+ tablearray[index + rspi][ci + cspi])
						}
					}
					rspi = rspi + 1;
				}
				cspi = cspi + 1;
			}
			if (thecolumn.children().length == 0 && thecolumn.text() == "") {
				tablearray[index][ci] = "none";
			} else {
				tablearray[index][ci] = thecolumn;
			}

			ci = ci + colspan;

			var nextci = ci + 1;
			while (nextci < columnlength && tablearray[index][ci] == "none") {
				ci = nextci;
				nextci = ci + 1;
			}

		})

	});

    //New parsing data structure
    var rowtextlist=[];

	rows.each(function(index, el) {
		var therow = $(this);

		var columns = therow.find("td");
        var rowtext = [];

		var ci = 0;
		columns.each(function() {
			var thecolumn = $(this);

			if (thecolumn.children().length == 0 && thecolumn.text() == "") {
			} else {
				rowtext.push(thecolumn.text());
			}

		})

        rowtextlist.push(rowtext);

	});

	// Extract data

	var studentname = rowtextlist[8][2];
	if (studentname == undefined) {
		makemessage("Error! cannot find student name.", false)
		return;
	}
	console.log("Student name is->" + studentname)

	var matricplusic = fixstring(rowtextlist[6][2]);
	var matcher = /\s*(\d+)IC.PassportNo\.\:(\d*)\s*/;
	var match = matcher.exec(matricplusic);
	var matricnumber = match[1];
	var icnumber = match[2];
	var sessionplusprogram = fixstring(rowtextlist[4][0]);
	console.log(sessionplusprogram);
	matcher = /Session\s*:\s*(\d+\/\d+)Semester\s*:\s*(\d+)/;
	match = matcher.exec(sessionplusprogram);
	var session = match[1];
	var semester = match[2];
	var program = fixstring(rowtextlist[6][5])
	console.log(program);
	var printedby= fixstring(rowtextlist[2][0]);
	var cfsmatcher = /Printedby\d{6}on([^,]+),.+/;
	var maincampusmatcher = /Printedby\d{7}on([^,]+),.+/;
    var cfsmatch=cfsmatcher.exec(printedby);
    var maincampusmatch=maincampusmatcher.exec(printedby);
    if(cfsmatch){
        makemessage("Looks like a cfs slip.");
	    var date = cfsmatch[1];
        var scheduletype="CFS";
        var starttableindex = 0;
        while (tablearray[starttableindex][1] == "none"
                || (tablearray[starttableindex][1].children("hr").length == 0)) {
            if (starttableindex >= tablearray.length) {
                alert("Fail to find start table index");
                return;
            }
            starttableindex = starttableindex + 1;
        }

        console.log("starttableindex->" + starttableindex.toString())

        var endtableindex = starttableindex;
        while (tablearray[endtableindex][20] == "none"
                || tablearray[endtableindex][20].text() != "Total") {
            if (endtableindex >= tablearray.length) {
                alert("Fail to find end table index");
                return;
            }

            endtableindex = endtableindex + 1;
        }

        console.log("endtableindex->" + endtableindex.toString())

        var coursearray = new Array();
        var currentcourse = 0;

        var i = starttableindex + 1;
        while (i < endtableindex) {

            if (tablearray[i][2] != "none") {
                if (currentcourse != 0) {
                    console.log("Schedule found->" + JSON.stringify(currentcourse));
                    coursearray.push(currentcourse);
                }
                currentcourse = {
                    code : tablearray[i][2].text(),
                    section : tablearray[i][9].text(),
                    title : tablearray[i][17].text(),
                    credithour : tablearray[i][26].text(),
                    schedule : new Array()
                }
            }

            if (tablearray[i][28] != "none") {
                var starttime = parseInt(tablearray[i][34].text(), 10);
                
                var parseendtime=/^[^\d]*(\d+)[^\d]*$/.exec(tablearray[i][36].text());
                if(!parseendtime){
                    console.log("Warning, end time for "+tablearray[i][2].text()+" miraculously missing. Using column 35");
                    if(tablearray[i][35]){
                        parseendtime=/^[^\d]*(\d+)[^\d]*$/.exec(tablearray[i][35].text());
                    }
                }
                if(!parseendtime){
                    console.log("Still nothing. Using column 37");
                    if(tablearray[i][37]){
                        parseendtime=/^[^\d]*(\d+)[^\d]*$/.exec(tablearray[i][37].text());
                    }
                }
                var endtime;
                if(!parseendtime){
                    console.log("Still missing. Lets just say it use 1 hour.");
                    endtime = starttime+1;
                }else{
                    endtime = parseInt(parseendtime[1], 10);
                }

                if (starttime < 8) {
                    starttime = starttime + 12;
                }

                if (endtime < 8) {
                    endtime = endtime + 12;
                }

                /*
                 * if(tablearray[i][41].text()=="PM"){ starttime=starttime+12;
                 * endtime=endtime+12; } if(tablearray[i][41].text()=="AM"){
                 * if(endtime<8){ endtime=endtime+12; } }
                 */

                var venue = tablearray[i][46].text();

                var newschedule = {
                    day : tablearray[i][28].text(),
                    start : starttime,
                    end : endtime,
                    venue : venue
                }
                currentcourse.schedule.push(newschedule);
            }

            i = i + 1;
        }
        console.log("Schedule found->" + JSON.stringify(currentcourse));
        coursearray.push(currentcourse);
    }else if(maincampusmatch){
        makemessage("Looks like a main campus slip.");
	    var date = maincampusmatch[1];
        var scheduletype="MAINCAMPUS";
        var starttableindex = 0;
        while (rowtextlist[starttableindex][0] != 'Course') {
            if (starttableindex >= tablearray.length) {
                alert("Fail to find start table index");
                return;
            }
            starttableindex = starttableindex + 1;
        }
        starttableindex+=2;

        console.log("starttableindex->" + starttableindex.toString())

        var endtableindex = starttableindex;
        while (rowtextlist[endtableindex][0]!='Total') {
            if (endtableindex >= tablearray.length) {
                alert("Fail to find end table index");
                return;
            }

            endtableindex = endtableindex + 1;
        }

        console.log("endtableindex->" + endtableindex.toString())

        //hold all course
        var coursearray = new Array();

        //Hold currently parsing course
        var currentcourse = undefined;

        //Add schedule to currentcourse
        function addschedule(starttime,endtime,venue,rawday){
            if(currentcourse == undefined){
                console.log("WARNING:Attempt to add schedule to current course when there is no current course");
                return;
            }
            var days=[];
            function make_long(d){
                if(d=='M')return "MON";
                if(d=='T')return "TUE";
                if(d=='W')return "WED";
                if(d=='TH')return "THUR";
                if(d=='F')return "FRI";
                if(d=='SN')return "SUN";
                if(d=='S')return "SAT";
                throw "Unknown day ->"+d;
            }

            if(/\s*(MON|TUE|WED|THUR|FRI|SAT|SUN)\s*/.exec(rawday)){
                days.push(rawday);
            }else if(/\s*(MON|TUE|WED|THUR|FRI|SAT|SUN)-(MON|TUE|WED|THUR|FRI|SAT|SUN)\s*/.exec(rawday)){
                var execed=/\s*(MON|TUE|WED|THUR|FRI|SAT|SUN)-(MON|TUE|WED|THUR|FRI|SAT|SUN)\s*/.exec(rawday);
                days.push(make_long( execed[1] ));
                days.push(make_long( execed[2] ));
            }else if(/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday)){
                var execed=/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday);
                days.push(make_long( execed[1] ));
                days.push(make_long( execed[2] ));
                days.push(make_long( execed[3] ));
            }else if(/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday)){
                var execed=/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday);
                days.push(make_long( execed[1] ));
                days.push(make_long( execed[2] ));
            }else if(rawday=="TWF"){
                days.push('TUE');
                days.push('WED');
                days.push('THUR');
            }else if("MTWTHF".indexOf(rawday)!=-1){
                var idx="MTWTHF".indexOf(rawday);
                var length=rawday.length;
                if(rawday.indexOf("TH")!=-1){
                    length--;
                }
                if(rawday=="F"){
                    idx-=1;
                }
                var dayidx=["MON","TUE","WED","THUR","FRI"];
                var i2=idx;
                while(i2<idx+length){
                    days.push(dayidx[i2]);
                    i2++;
                }
            }else{
                throw "Unknown day format ->"+rawday;
            }

            _.each(days,function(day){
                var newschedule = {
                    day : day,
                    start : starttime,
                    end : endtime,
                    venue : venue
                }
                currentcourse.schedule.push(newschedule);
            });
        }

        var i = starttableindex + 1;
        while (i < endtableindex) {

            var currow=rowtextlist[i];

            if (rowtextlist[i].length == 0) {
                //Add it if not added
                if(currentcourse != undefined){
                    coursearray.push(currentcourse);
                }
                currentcourse = undefined;
            }

            if (rowtextlist[i].length == 10) {
                currentcourse = {
                    code : currow[0],
                    section : currow[1],
                    title : currow[3],
                    credithour : currow[4],
                    schedule : new Array()
                }

                var starttime = parseFloat(currow[6], 10);
                var parseendtime=/^\D*([0-9\.]+)\D*$/.exec(currow[7]);
                if(!parseendtime){
                    console.log("Missing end time. Lets just say it use 1 hour.");
                    endtime = starttime+1;
                }else{
                    endtime = parseFloat(parseendtime[1], 10);
                }

                if(currow[8]=="PM" && starttime<12 && endtime<12){ starttime=starttime+12;
                endtime=endtime+12; } 
                var venue = currow[9];
                var rawday= currow[5];
                //Add the schedule
                addschedule(starttime,endtime,venue,rawday);
            }
            if (rowtextlist[i].length == 5) {
                var starttime = parseFloat(currow[1], 10);
                var parseendtime=/^\D*([0-9\.]+)\D*$/.exec(currow[2]);
                if(!parseendtime){
                    console.log("Missing end time. Lets just say it use 1 hour.");
                    endtime = starttime+1;
                }else{
                    endtime = parseFloat(parseendtime[1], 10);
                }

                if(currow[3]=="PM" && starttime<12 && endtime<12){ starttime=starttime+12;
                endtime=endtime+12; } 
                var venue = currow[4];
                var rawday= currow[0];
                //Add the schedule
                addschedule(starttime,endtime,venue,rawday);
            }

            i = i + 1;
        }

        //Add it if not added
        if(currentcourse != undefined){
            coursearray.push(currentcourse);
        }
        currentcourse = undefined;

        console.log("Schedule found->" + JSON.stringify(coursearray));
    }else{
        throw "Unknown Schedule Type, match string -> "+printedby;
    }


	// format data

	var data = JSON.stringify({
		studentname : studentname,
		coursearray : coursearray,
		matricnumber : matricnumber,
		ic : icnumber,
		session : session,
		semester : semester,
		program : program,
        scheduletype:scheduletype
	});


	makemessage("Saving schedule...please wait...");
	$.ajax({
	 url:"http://iiumschedule.asdacap.com/scheduleformatter/",
     type:"POST",
     data:{data : data},
	 success:function(response) {
        var thetoken = response;
        makemessage(
        "Done! Please click <a target='_blank' href='http://iiumschedule.asdacap.com/scheduleformatter/?token="
                    + thetoken
                    + "' >this link</a> to continue.<br />"+
        "Or, <a href='javascript:error(\"Voluntary Error Report\",1)'>Click here</a> to report incorrect result or simply to comments and stuff.",
        false);
        },
     error:function(err,textstatus,errthrown){
        makemessage(
            "Error saving schedule ->"+textstatus+" . The server may be down. Please try again later.",
            false
        );
     }
    });


}

