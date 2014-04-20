
angular.module('smaker',['ngAnimate','pasvaz.bindonce'])
.service('smglobal',function($rootScope,$q,$http){
    var gobj={
        mode:'startpage',
        schedule:{},
        coursearray:[],
        session:'',
        student_type:'',
        semester:'',
        sectioncache:{},
        cur_hover_section:undefined,
        loading_section_query:false
    };

    gobj.add_section=function(section){
        var c=gobj.has_collide(section);
        if(c){
            alert('This section collide with '+c.code+' section '+c.section);
            return;
        }
        var obj=section;

        //Allright now we just need to add this.
        //But WAIT. We'll need to check if another section of the subject has been specified
        if(!gobj.section_added(section.section_id)){
            if(gobj.subject_added(section.code)){
                alert("Another section has been selected for this subject. Please remove that first");
            }else{
                gobj.schedule[obj.code]=obj;
            }
        }

    }

    gobj.subject_added=function(code){
        return gobj.schedule[code];
    }

    gobj.section_added=function(section_id){
        return _.find(gobj.schedule,function(o){return o.section_id == section_id; });
    }

    gobj.remove_section=function(section_id){
        var section=gobj.section_added(section_id);
        delete gobj.schedule[section.code];
    }

    gobj.replace_section=function(section,subject){
        var asection=gobj.subject_added(subject.code);
        gobj.remove_section(asection.section_id);
        gobj.add_section(section,subject);
    }

    //This check if the section's schedule collide with each other
    gobj.check_collide=function(section1,section2){
        return _.find(section1.schedule,function(s1){
            return _.find(section2.schedule,function(s2){
                if(s1.day==s2.day &&
                    ( (s1.end <= s2.end && s1.end > s2.start) || (s1.start >= s2.start && s1.start < s2.end) )
                ){
                    return true;
                }
                return false;
            }) != undefined;
        }) != undefined;
    }

    //Check if the section collide with anything in current schedule except with itself
    gobj.has_collide=function(section){
        return _.find(gobj.schedule,function(c){
            if(c.section_id!=section.section_id){
                if(gobj.check_collide(c,section)){
                    return true;
                }
            }
            return false;
        });
    }

    //Preprocess downloaded section data for easier processing.
    gobj.section_preprocess=function(section,subject){

        var obj={
            section_id:section.id,
            code:subject.code,
            credithour:subject.ch,
            section:section.sectionno,
            title:subject.title,
            lecturer:section.lecturer,
            venue:section.venue,
            time:section.time,
            day:section.day,
            schedule:[]
        };

        //small venue is the first word in venue
        var small=section.venue.split(' ');
        obj.smallvenue=small[0];

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
            return obj;
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
            console.log( "Unknown day format ->"+rawday+" please be patient as we resolve this issue.");
            return obj;
        }

        return obj;
    }

    //fetch section from cache or server

    gobj.fetch_section=function(sub){

        var deferred=$q.defer();

        function successc(obj){
            var list=obj.data;
            gobj.sectioncache[sub.id]=obj;
            var alist=[];
            for(var i=0;i<list.length;i++){
                var hasa=gobj.section_preprocess(list[i],sub);
                if(hasa){
                    alist.push(hasa);
                }else{
                    console.log('Warning, unable to preprocess section '+list[i].sectionno);
                }
            }
            list=alist;
            return list;
        }

        if(gobj.sectioncache[sub.id]!=undefined){
            setTimeout(function(){
                $rootScope.$apply(function(){
                    deferred.resolve(successc(gobj.sectioncache[sub.id]));
                });
            });
            return deferred.promise;
        }

        return $http({
            url:'/schedulemaker/fetch_section/',
            params:{id:sub.id},
            method:'GET'
        }).then(successc);
    }

    return gobj;
})
.controller('schedulemaker',function(smglobal,$scope,$http){

    $scope.smglobal=smglobal;

    $scope.alert=function(t){
        console.log('This is alert '+t);
    }

    function resyncschedule(){
        $scope.schedule=_.values(smglobal.schedule);
        if(smglobal.cur_hover_section!=undefined){
            var obj=$.extend({},smglobal.cur_hover_section);
            obj.hover=true;
            $scope.schedule.push(obj);
        }
    }

    $scope.generateLink=function(){
        return location.origin+"/schedulemaker/?"+$.param({
            ses:smglobal.session,
            sem:smglobal.semester,
            st:smglobal.student_type,
            code:_.pluck(smglobal.schedule,'code').join(','),
            section:_.pluck(smglobal.schedule,'section').join(','),
        });
    }

    $scope.$watchCollection('smglobal.schedule',resyncschedule);
    $scope.$watch('smglobal.cur_hover_section',resyncschedule);

}).controller('startform',function($scope,$http,smglobal,$timeout,$q,$rootScope){

    $scope.available_sessions=[
        "2013/2014",
        "2014/2015"
    ];
    $scope.available_student_type={ug:'undergraduate',pg:"postgraduate"};
    $scope.session='2014/2015';
    $scope.student_type='ug';
    $scope.semester=1;

    //This is the thing that happen when the user select the year and session
    $scope.start_form_submit=function(){
        if(
            $scope.start_form.session.$valid && $scope.start_form.session != undefined &&
            $scope.start_form.semester.$valid && $scope.start_form.session != undefined &&
            $scope.start_form.student_type.$valid && $scope.start_form.session != undefined
        ){
            $scope.show_submit_error=false;
            smglobal.mode='startloading';

            _.extend(smglobal,_.pick($scope,'session','semester','student_type'));

            var params={
                session:$scope.session,
                semester:$scope.semester,
                coursetype:$scope.student_type
            }

            $http({url:'/schedulemaker/fetch_subject/',params:params,method:'GET'})
            .success(function(coursearray){
                smglobal.mode='picker';
                _.each(coursearray,function(v,kuly){
                    _.each(v,function(sub){
                        sub.kuly=kuly;
                    });
                });
                smglobal.coursearray=coursearray;
                $(window).resize();

                if(window.schedulequery){

                    //add the course in the querystring
                    var codes=window.schedulequery.code.split(',');
                    var sections=window.schedulequery.section.split(',');
                    var promises=[];
                    var i=0;
                    while(i<codes.length){
                        //find the subject object
                        var code=codes[i];
                        var subject=undefined;
                        var csection=sections[i];
                        _.find(coursearray,function(v){
                            return _.find(v,function(sub){
                                if(sub.code==code){
                                    subject=sub;
                                    return true;
                                }
                            });
                        });
                        
                        //get the sections
                        var promise=smglobal.fetch_section(subject).then(function(fetchedsections){
                            _.find(fetchedsections,function(section){
                                if(section.section==csection){
                                    smglobal.add_section(section);
                                }
                            });
                        });
                        promises.push(promise);
                        i++;
                    }
                    
                    $q.all(promises).then(function(){
                        smglobal.loading_section_query=false;
                    });

                }

            }).error(function(){
                smglobal.mode='startpage';
                smglobal.loading_section_query=true;
                alert('Sorry, an error happened when fetching subjects. The server may be down');
            });

        }else{
            $scope.show_submit_error=true;
            console.log("Submit called start form "+JSON.stringify($scope.start_form.$valid));
        }
    };

    //if link provide query, autoload it.
    if(window.schedulequery){
        $scope.session=window.schedulequery.ses;
        $scope.semester=window.schedulequery.sem;
        $scope.student_type=window.schedulequery.st;
        $timeout(function(){
            $scope.start_form_submit();
        },10);
    }
}).controller('sectionSelector',function($scope,smglobal,$filter){

    //selector stuff, a subject is all subject in an array
    _.extend($scope,{
        selected_kuly:'',
        asubject:[],
        smglobal:smglobal,
        mode:'subject',
        loading_section:false,
        scroll_limit_reached:false,
        selected_subject:{}
    });

    var scrollthreshold=300;

    function refilter(){
        if($scope.selected_kuly!=''){
            $scope.filteredSubject=$filter('filter')($scope.asubject,{kuly:$scope.selected_kuly});
        }else{
            $scope.filteredSubject=$scope.asubject;
        }
        $scope.filteredSubject=$filter('filter')($scope.filteredSubject,$scope.subsearch);

        if($scope.filteredSubject.length>scrollthreshold){
            $scope.filteredSubject=_.first($scope.filteredSubject,scrollthreshold);
            $scope.scroll_limit_reached=true;
        }else{
            $scope.scroll_limit_reached=false;
        }
    }

    $scope.$watch('selected_kuly',refilter);
    $scope.$watch('subsearch',refilter);
    $scope.$watch('asubject',refilter);


    $scope.toggle_selected=function(k){
        if($scope.selected_kuly==k){
            $scope.selected_kuly='';
        }else{
            $scope.selected_kuly=k;
        }
    }

    $scope.show_section=function(sub){
        $scope.selected_subject=sub;
        $scope.loading_section=true;
        $scope.mode='section';

        smglobal.fetch_section(sub).then(function(obj){
            $scope.csections=obj;
            $scope.loading_section=false;
        },function(){
            alert("Sorry, failed to load section.");
            $scope.mode='subject';
            $scope.loading_section=false;
        });

    }


    $scope.$watchCollection(function(){return smglobal.coursearray;},function(){
        $scope.asubject=[];
        _.each(smglobal.coursearray,function(arr,kuly){
            _.each(arr,function(obj,i){
                $scope.asubject.push(obj);
            });
        });
    });



}).directive('formattedSchedule',function(){
    return {
        scope:{
            template:'=?',
            schedule:'='
        },
        link:function(scope,element,attrs){
            if(scope.template==undefined || scope.template==''){
                scope.template='#schedtemplate';
            }

            function redraw(){
                var schedule=scope.schedule;
                if(schedule==undefined){
                    schedule=[];
                }
                var cdata=convert_data({coursearray:schedule});
                $(element).html((new EJS({text:$(scope.template).html()})).render(cdata));
            }

            //This will cause the schedule display to redraw everytime the schedule change 
            scope.$watch('schedule',redraw);

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
    }
}).directive('niceScroll',function(){
    return {
        link:function(scope,el,attr){
            $(el).niceScroll();
        }
    }
})
.controller('generator',function(smglobal,$scope,$filter,$q){

    //selector stuff, a subject is all subject in an array
    _.extend($scope,{
        selected_kuly:'',
        asubject:[],
        smglobal:smglobal,
        mode:'subject',
        selectedSubjects:[],
        result_threshold:50,
        actual_length:0
    });


    _.each(smglobal.schedule,function(sect){
        var code=sect.code;
        _.find(smglobal.coursearray,function(list){
            return _.find(list,function(sub){
                if(sub.code==sect.code){
                    $scope.selectedSubjects.push(sub);
                    return true;
                }
            });
        });
    });

    function refilter(){
        if($scope.selected_kuly!=''){
            $scope.filteredSubject=$filter('filter')($scope.asubject,{kuly:$scope.selected_kuly});
        }else{
            $scope.filteredSubject=$scope.asubject;
        }
        $scope.filteredSubject=$filter('filter')($scope.filteredSubject,$scope.subsearch);
    }

    $scope.$watch('selected_kuly',refilter);
    $scope.$watch('subsearch',refilter);
    $scope.$watch('asubject',refilter);

    $scope.sectioncount={};

    var fetch_sections=function(){

        var coursearray={};
        var promises=[];
        _.each($scope.selectedSubjects,function(sub){
            var defer=smglobal.fetch_section(sub);
            defer.then(function(list){
                if(list.length){
                    coursearray[sub.code]=list;
                    $scope.sectioncount[sub.code]=list.length;
                }
            });
            promises.push(defer);
        });

        $q.all(promises).then(function(){

            var values=_.values(coursearray);

            var temp=[];
            var results=[];

            function has_collide(arr,it){
                if(arr.length==0){
                    return false;
                }
                return _.find(arr,function(c){
                    return smglobal.check_collide(c,it);
                });
            }

            //will do a tree search for the possible uncollide schedule
            function recurit(temp,depth){
                _.each(values[depth],function(cur){

                    if(has_collide(temp,cur)){
                        return;
                    }

                    temp.push(cur);
                    if(depth<values.length-1){
                        recurit(temp,depth+1);
                    }else if(depth==values.length-1){
                        var nc=temp.slice(0);
                        results.push(nc);
                    }

                    temp.splice('-1',1);
                });
            }
            recurit(temp,0);

            $scope.actual_length=results.length;
            if(results.length>$scope.result_threshold){
                $scope.results=_.first(results,$scope.result_threshold);
            }else{
                $scope.results=results;
            }

        },function(){
            console.log('Error, fail to fetch all section ');
        });

    }
    $scope.$watchCollection('selectedSubjects',fetch_sections);
    $scope.$watchCollection('result_threshold',fetch_sections);
    fetch_sections();

    $scope.toggle_selected=function(k){
        if($scope.selected_kuly==k){
            $scope.selected_kuly='';
        }else{
            $scope.selected_kuly=k;
        }
    }

    $scope.$watchCollection(function(){return smglobal.coursearray;},function(){
        $scope.asubject=[];
        _.each(smglobal.coursearray,function(arr,kuly){
            _.each(arr,function(obj,i){
                $scope.asubject.push(obj);
            });
        });
    });

    $scope.subjectAdded=function(s){
        var ret=_.find($scope.selectedSubjects,function(i){return i==s;});
        return ret;
    }

    $scope.addSubject=function(s){
        if(!$scope.subjectAdded(s)){
            $scope.selectedSubjects.push(s);
        }
    }

    $scope.removeSubject=function(s){
        $scope.selectedSubjects=_.without($scope.selectedSubjects,s);
    }

    $scope.toggleSubject=function(s){
        $scope.subjectAdded(s)?$scope.removeSubject(s):$scope.addSubject(s);
    }

    $scope.useResult=function(r){
        var newschedule={};
        _.each(r,function(ri){
            newschedule[ri.code]=ri;
        });
        smglobal.schedule=newschedule;
        smglobal.mode='picker';
    }

}).controller('formatterform',function($scope,smglobal,$http){

    $scope.smglobal=smglobal;
    $scope._=window._;
    $scope.JSON=window.JSON;

    $scope.$watchCollection('smglobal.schedule',function(){
        var schedule=_.map(smglobal.schedule,function(scheditem,key){
            return _.pick(scheditem,'code','credithour','schedule','section','title');
        });
        $scope.schedule=schedule;
    });

    $scope.token='';
    $scope.requested=false;
    $scope.requesting=false;

    $scope.save=function(){

        var data={
            scheduletype:"MAINCAMPUS",
            ic:'',
            matricnumber:'',
            program:'',
            semester:'',
            session:'',
            studentname:''
        };

        _.extend(data,_.pick(smglobal,'ic','matricnumber','program','semester','session','studentname'));

        data.coursearray=$scope.schedule;

        $scope.requesting=true;
        $scope.requested=false;

        $.ajax({
            url:"/scheduleformatter/",
            type:"POST",
            data:{data : JSON.stringify(data)},
            success:function(token) {
                $scope.$apply(function(){
                    $scope.token=token;
                    $scope.requested=true;
                    $scope.requesting=false;
                });
            },
            error:function(err,textstatus,errthrown){
                $scope.$apply(function(){
                    $scope.requesting=false;
                    alert('Sorry, an error occur while saving schedule.');
                    console.log('Error saving '+err);
                });
            }
        });

    }


});
