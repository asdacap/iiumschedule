
	function schedulemaker($scope,$http){

		//possible mode are startpage,startloading,picker
		$scope.mode='startpage';

		$scope.available_sessions=[
		"2013/2014",
		"2014/2015"
		];
		$scope.available_student_type={ug:'undergraduate',pg:"postgraduate"};

        //defaults
		//The schedule
		$scope.schedule=[];
        $scope.schedule_bycode={};
		$scope.coursearray=[];
        $scope.session='2013/2014';
        $scope.student_type='ug';
        $scope.semester=2;

		//selector stuff, a subject is all subject in an array
		$scope.selector={
			selected_kuly:'',
			asubject:[],
			mode:'subject',
			toggle_selected:function(k){
				if($scope.selector.selected_kuly==k){
					$scope.selector.selected_kuly='';
				}else{
					$scope.selector.selected_kuly=k;
				}
			},
			loading_section:false,
			selected_subject:{},
			sectioncache:{},
			show_section:function(sub){
				$scope.selector.selected_subject=sub;
				$scope.selector.loading_section=true;
				$scope.selector.mode='section';

				function successc(list){
                    $scope.selector.sectioncache[sub.id]=list;
                    var alist=[];
                    for(var i=0;i<list.length;i++){
                        var hasa=$scope.section_preprocess(list[i],sub);
                        if(hasa){
                            alist.push(hasa);
                        }else{
                            console.log('Warning, unable to preprocess section '+list[i].sectionno);
                        }
                    }
                    list=alist;
                    $scope.selector.csections=list;
                    $scope.selector.loading_section=false;
                }

                if($scope.selector.sectioncache[sub.id]!=undefined){
					successc($scope.selector.sectioncache[sub.id]);
					return;
				}

				$http({
					url:'/schedulemaker/fetch_section/',
					params:{id:sub.id},
					method:'GET'
				}).success(successc).error(function(argument) {
					alert("Sorry, failed to load section.");
					$scope.selector.mode='subject';
					$scope.selector.loading_section=false;
				});
			}

		};

		$scope.$watch('coursearray',function(){
			$scope.selector.asubject=[];
			for(var k in $scope.coursearray){
				if($scope.coursearray.hasOwnProperty(k)){
					for (var i = $scope.coursearray[k].length - 1; i >= 0; i--) {
						var obj=$scope.coursearray[k][i];
						obj=$.extend({},obj);
						obj.kuliyyah=k;
						$scope.selector.asubject.push(obj);
					};
				}
			}
		});

		$scope.show_submit_error=false;

        //This is the thing that happen when the user select the year and session
		$scope.start_form_submit=function(){
			if(
				$scope.start_form.session.$valid && $scope.start_form.session != undefined &&
				$scope.start_form.semester.$valid && $scope.start_form.session != undefined &&
				$scope.start_form.student_type.$valid && $scope.start_form.session != undefined
			){
				$scope.show_submit_error=false;
				$scope.mode='startloading';

				var params={
					session:$scope.session,
					semester:$scope.semester,
					coursetype:$scope.student_type
				}

				$http({url:'/schedulemaker/fetch_subject/',params:params,method:'GET'})
				.success(function(coursearray){
					$scope.mode='picker';
					$scope.coursearray=coursearray;
                    $(window).resize();
				}).error(function(){
					$scope.mode='startpage';
					alert('Sorry, an error happened when fetching subjects. The server may be down');
				});

			}else{
				$scope.show_submit_error=true;
				console.log("Submit called start form "+JSON.stringify($scope.start_form.$valid));
			}
		};

        //Preprocess downloaded section data for easier processing.
        $scope.section_preprocess=function(section,subject){

            var obj={
                section_id:section.id,
                code:subject.code,
                credithour:subject.credithour,
                section:section.sectionno,
                title:subject.title,
                lecturer:section.lecturer,
                venue:section.venue,
                time:section.time,
                day:section.day,
                schedule:[]
            };

            //Next is parsing it. Partially copied from scheduleformatter2.js

            var rtimes=/^([0-9\.]+)\s*-\s*([0-9\.]+)\s*(AM|PM)$/.exec(section.time);
            var starttime=1;
            var endtime=2;
            if(!rtimes || rtimes.length!=4){
                if(section.time==' -  '){
                    console.log("WARNING:Unfortunately this section's schedule is not available yet. Please select another section,");
                }else{
                    console.log('WARNING:Error: unable to identify the format for the time '+section.time+'. Please be patient while we try to fix this issue');
                }
                return;
            }else{

                starttime = parseFloat(rtimes[1], 10);

                var parseendtime=/^\D*([0-9\.]+)\D*$/.exec(rtimes[2]);
                if(!parseendtime){
                    console.log("Missing end time. Lets just say it use 1 hour.");
                    endtime = starttime+1;
                    }else{
                    endtime = parseFloat(parseendtime[1], 10);
                }

                if(rtimes[3]=="PM" && starttime<12 && endtime<12){ starttime=starttime+12;
                    endtime=endtime+12; 
                } 

                obj.starttime=starttime;
                obj.endtime=endtime;

            }

            var rawday=section.day;
            if(/\s*(MON|TUE|WED|THUR|FRI|SAT|SUN)\s*/.exec(rawday)){
                var day=rawday;
                var newschedule = {
                    day : day,
                    start : starttime,
                    end : endtime,
                    venue : obj.venue
                }
                obj.schedule.push(newschedule);
            }else if(/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday)){
                var execed=/\s*(M|TH|W|T|F|SN|S)\s*-\s*(M|TH|W|T|F|SN|S)\s*/.exec(rawday);
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
                    venue : obj.venue
                }

                obj.schedule.push(newschedule);
                var d2=make_long(execed[2]);

                newschedule = {
                    day : d2,
                    start : starttime,
                    end : endtime,
                    venue : obj.venue
                }

                obj.schedule.push(newschedule);
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
                    var newschedule = {
                        day : dayidx[i2],
                        start : starttime,
                        end : endtime,
                        venue : venue
                    }
                    obj.schedule.push(newschedule);
                    i2++;
                }
            }else{
                alert( "Unknown day format ->"+rawday+" please be patient as we resolve this issue.");
                return;
            }

            return obj;
        }

        $scope.add_section=function(section){
            var c=$scope.has_collide(section);
            if(c){
                alert('This section collide with '+c.code+' section '+c.section);
                return;
            }
            var obj=section;
            //Allright now we just need to add this.
            //But WAIT. We'll need to check if another section of the subject has been specified

            if(!$scope.section_added(section.section_id)){
                if($scope.subject_added(section.code)){
                    alert("Another section has been selected for this subject. Please remove that first");
                }else{
                    $scope.schedule_bycode[obj.code]=obj;
                }
            }

        }

        $scope.subject_added=function(code){
            return $scope.schedule_bycode[code];
        }

        $scope.section_added=function(section_id){

            for(var i=0;i<$scope.schedule.length;i++){
                var c=$scope.schedule[i];
                if(c.section_id==section_id){
                    return true;
                }
            }
            return false;

        }

        $scope.remove_section=function(section_id){
            for(var i=0;i<$scope.schedule.length;i++){
                var c=$scope.schedule[i];
                if(c.section_id==section_id){
                    delete $scope.schedule_bycode[c.code];
                    return;
                }
            }
        }

        $scope.replace_section=function(section,subject){
            var asection=$scope.subject_added(subject.code);
            $scope.remove_section(asection.section_id);
            $scope.add_section(section,subject);
        }

        //This check if the section's schedule collide with each other
        $scope.check_collide=function(section1,section2){
            for(var i=0;i<section1.schedule.length;i++){
                for(var i2=0;i2<section2.schedule.length;i2++){
                    var s1=section1.schedule[i];
                    var s2=section2.schedule[i2];
                    if(s1.day==s2.day &&
                        ( (s1.end <= s2.end && s1.end > s2.start) || (s1.start >= s2.start && s1.start < s2.end) )
                    ){
                        return true;
                    }
                }
            }
            return false;
        }

        //Check if the section collide with anything in current schedule except with itself
        $scope.has_collide=function(section){
            for(var i=0;i<$scope.schedule.length;i++){
                var c=$scope.schedule[i];
                if(c!=section){
                    if($scope.check_collide(c,section)){
                        return c;
                    }
                }
            }
            return false;
        }

        //This watch statement will syncronize schedule with schedule_bycode
        $scope.$watchCollection('schedule_bycode',function(){
            $scope.schedule=[];
            for(key in $scope.schedule_bycode){
                if($scope.schedule_bycode.hasOwnProperty(key)){
                    $scope.schedule.push($scope.schedule_bycode[key]);
                }
            }
        });

        //This will cause the schedule display to redraw everytime the schedule change 
        $scope.$watchCollection('schedule',function(){
            var cdata=convert_data({coursearray:$scope.schedule});
            $('#scheduleholder').html((new EJS({text:$('#schedtemplate').html()})).render(cdata));
        });


        //convert data gathered from crs into data that can be used by template
        function convert_data(data){

            function makearray(length) {
                var thearray = new Array();
                var i = 0;
                while (i < length) {
                    thearray.push("");
                    i = i + 1;
                }
                return thearray;
            }

            var coursearray = data.coursearray;
            
            var starthour=8;
            var actualstarthour=8;
            var actualendhour=20;
            /* Hardcode the range
            var i=0;
            while(i<coursearray.length){
                var i2=0;
                var ccourse=coursearray[i];
                while(i2<ccourse.schedule.length){
                    var sched=ccourse.schedule[i2];
                    var start=Math.floor(sched.start);
                    if(start<actualstarthour){
                        //actualstarthour=start;
                    }
                    var end=Math.floor(sched.end);
                    if(sched.end>end){
                        end+=1;
                    }
                    if(end>actualendhour){
                        //actualendhour=end;
                    }
                    i2=i2+1;
                }
                i=i+1;
            }
            */
            
            var startfminute=actualstarthour*12;
            var endfminute=actualendhour*12;

            var hournum=14;
            var actualhournum=actualendhour-actualstarthour;
            var fiveminutenum=actualhournum*12;

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

            var thedata = {
                byfiveminute : byfiveminute,
                actualstarthour : actualstarthour,
                actualendhour : actualendhour,
                courselist : coursearray,
            }
            return thedata;
        }

	}

	
