var columnlength = 52;

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
		poststring = "</br><img src='https://iiumschedule.appspot.com/static/loading.gif'></img>";
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

function error(e){
	globerr=e;
	if(!$("#iiumschedulediv").length){
		$("body").append("<div id='iiumschedulediv' style='width:100%;text-align:center;margin-top:10px;'></div>");
	}
	var maindiv=$("#iiumschedulediv");
	maindiv.html("");
	maindiv.append("<h3>Error detected...</h3>");
	maindiv.append("<p>Sorry, an error occur. Would you be so kind to send me some data to help fix this bug? <br /> WARNING: this WILL include your CRS</p>");
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
		theform.attr("action","https://iiumschedule.appspot.com/error");
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
	try{
		parsetable();
	}catch(e){
		error(e);
	}
}

function parsetable() {

    makemessage("Validating path");

    if(/^\/portal\/page\/portal\//.exec(window.location.pathname)){
        if(!$("#iiumschedulediv").length){
            $("body").append("<div id='iiumschedulediv' style='width:100%;text-align:center;margin-top:10px;'></div>");
        }
        var maindiv=$("#iiumschedulediv");
        maindiv.append("<h3>Wrong Usage</h3>");
        maindiv.append("Please use the code on the CRS/<a target='_blank' href='/phpaps/run_rep_list.php?rep_key=confslip1&keepThis=true&TB_iframe=true&height=630&width=900'>Confirmation Slip</a> page.");
        maindiv.append("<br />Not on the main portal page.");
        return;
    }

	// parse table
	makemessage("Parsing table, please wait...");

	var tablearray = new Array();

	var rows = $("body table").find("tr");

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

	})

	// Extract data

	var studentname = tablearray[8][10].text();
	if (studentname == "none") {
		makemessage("Error! cannot find student name.", false)
		return;
	}
	console.log("Student name is->" + studentname)

	var matricplusic = fixstring(tablearray[6][10].text());
	var matcher = /\s*(\d+)IC.PassportNo\.\:(\d*)\s*/;
	var match = matcher.exec(matricplusic);
	var matricnumber = match[1];
	var icnumber = match[2];
	var sessionplusprogram = fixstring(tablearray[4][21].text());
	console.log(sessionplusprogram);
	matcher = /Session\s*:\s*(\d+\/\d+)Semester\s*:\s*(\d+)/;
	match = matcher.exec(sessionplusprogram);
	var session = match[1];
	var semester = match[2];
	var program = fixstring(tablearray[6][43].text())
	console.log(program);
	var printedby= fixstring(tablearray[2][1].text());
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
                var starttime = parseFloat(tablearray[i][34].text(), 10);
                
                var parseendtime=/^\D*([0-9\.]+)\D*$/.exec(tablearray[i][36].text());
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
                    endtime = parseFloat(parseendtime[1], 10);
                }

                if(tablearray[i][41].text()=="PM"){ starttime=starttime+12;
                endtime=endtime+12; } 

                var venue = tablearray[i][46].text();
                
                var rawday=tablearray[i][28].text();
                if(/\s*(MON|TUE|WED|THUR|FRI|SAT|SUN)\s*/.exec(rawday)){
                    var day=rawday;
                    var newschedule = {
                        day : day,
                        start : starttime,
                        end : endtime,
                        venue : venue
                    }
                    currentcourse.schedule.push(newschedule);
                }else{
                    var execed=/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday);
                    if(execed){
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
                        var d1=make_long(execed[1]);
                        var newschedule = {
                            day : d1,
                            start : starttime,
                            end : endtime,
                            venue : venue
                        }
                        currentcourse.schedule.push(newschedule);
                        var d2=make_long(execed[2]);
                        newschedule = {
                            day : d2,
                            start : starttime,
                            end : endtime,
                            venue : venue
                        }
                        currentcourse.schedule.push(newschedule);
                    }else{
                        throw "Unknown day format ->"+rawday;
                    }
                }
                
            }

            i = i + 1;
        }
        console.log("Schedule found->" + JSON.stringify(currentcourse));
        coursearray.push(currentcourse);
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
	 url:"https://iiumschedule.appspot.com/scheduleformatter/",
     type:"POST",
     data:{data : data},
	 success:function(response) {
        var thetoken = response;
        makemessage(
        "Done! Please click <a target='_blank' href='https://iiumschedule.appspot.com/scheduleformatter/?token="
                    + thetoken
                    + "' >this link</a> to continue.",
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
