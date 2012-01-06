function startscheduler(){
  var e=document.createElement('script');
  e.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
  e.type='text/javascript';
  e.addEventListener('load', parsetable )
  document.getElementsByTagName('head')[0].appendChild(e); 
}

var columnlength=52;

function makearray(length){
  var thearray=new Array();
  var i=0;
  while(i<length){
    thearray.push("");
    i=i+1;
  }
  return thearray;
}

function parsetable(){
   //parse table
  
  var tablearray=new Array();
  
  var rows=$("body table").find("tr");
  
  var i=0;
  while(i<rows.length){
    tablearray.push(makearray(columnlength))
    i=i+1;
  }
  
  
  rows.each(function(index,el){
    var therow=$(this);
    
    var columns=therow.find("td");
    
    var ci=0;
    columns.each(function(){
      var thecolumn=$(this);
      
      var colspan=1;
      if(thecolumn.attr("colspan")){colspan=parseInt(thecolumn.attr("colspan"),10);}
      
      var rowspan=1;
      if(thecolumn.attr("rowspan")){rowspan=parseInt(thecolumn.attr("rowspan"),10);}
      
      var cspi=0;
      while(cspi<colspan){
	var rspi=0;
	while(rspi<rowspan){
	  if(cspi==0 && rspi==0){}else{
	  if(tablearray[index+rspi][ci+cspi]==""){
	    tablearray[index+rspi][ci+cspi]="none"
	  }else{
	    console.log("warning, table array on rspi/cspi"+(index+rspi).toString()+"/"+(cs+cspi).toString()+" is not empty->"+tablearray[index+rspi][ci+cspi])
	  }
	  }
	  rspi=rspi+1;
	}
	cspi=cspi+1;
      }
      if(thecolumn.children().length==0 && thecolumn.text()==""){
      tablearray[index][ci]="none";
      }else{
      tablearray[index][ci]=thecolumn;
      }
      
      ci=ci+colspan;
      
      var nextci=ci+1;
      while(nextci<columnlength && tablearray[index][ci]=="none"){
	ci=nextci;
	nextci=ci+1;
      }
      
    })
    
    
  })
  
  //Extract data
  
  var studentname=tablearray[8][10].text();
  if(studentname=="none"){
    alert("Fail to find student name");
    return;
  }
  console.log("Student name is->"+studentname)
  
  var starttableindex=0;
  while(tablearray[starttableindex][1]=="none" || (tablearray[starttableindex][1].children("hr").length==0)){
    if(starttableindex>=tablearray.length){
      alert("Fail to find start table index");
      return;
    }
    starttableindex=starttableindex+1;
  }
  
  console.log("starttableindex->"+starttableindex.toString())
  
  var endtableindex=starttableindex;
  while(tablearray[endtableindex][20]=="none" || tablearray[endtableindex][20].text()!="Total"){
    if(endtableindex>=tablearray.length){
      alert("Fail to find end table index");
      return;
    }
    
    endtableindex=endtableindex+1;
  }
  
  console.log("endtableindex->"+endtableindex.toString())
  
  var coursearray=new Array();
  var currentcourse=0;
  
  var i=starttableindex+1;
  while(i<endtableindex){
    
    if(tablearray[i][2]!="none"){
      if(currentcourse!=0){
	console.log("Schedule found->"+JSON.stringify(currentcourse));
	coursearray.push(currentcourse);
      }
      currentcourse=
      {code:tablearray[i][2].text(),
	section:tablearray[i][9].text(),
	title:tablearray[i][17].text(),
	credithour:tablearray[i][26].text(),
	schedule:new Array(),
      }
    }
    
    if(tablearray[i][28]!="none"){
      var starttime=parseInt(tablearray[i][34].text(),10);
      var endtime=parseInt(/^[^\d]*(\d+)[^\d]*$/.exec(tablearray[i][36].text())[1],10);
      
      if(starttime<8){
	starttime=starttime+12;
      }
      
      if(endtime<8){
	endtime=endtime+12;
      }
      
      /*
      if(tablearray[i][41].text()=="PM"){
	starttime=starttime+12;
	endtime=endtime+12;
      }
      if(tablearray[i][41].text()=="AM"){
	if(endtime<8){
	  endtime=endtime+12;
	}
      }*/
      
      var venue=tablearray[i][46].text();
      
      var newschedule=
      {
	day:tablearray[i][28].text(),
	start:starttime,
	end:endtime,
	venue:venue,
      }
      currentcourse.schedule.push(newschedule);
    }
    
    i=i+1;
  }
  console.log("Schedule found->"+JSON.stringify(currentcourse));
  coursearray.push(currentcourse);
  
  //format data
  
  var data=JSON.stringify({studentname:studentname,coursearray:coursearray});
  
  $.post("http://iiumschedule.appspot.com/scheduleformatter/",{data:data},function(response){
     var thetoken=response;
     var newwindow=window.open("http://iiumschedule.appspot.com/scheduleformatter/?token="+thetoken,"Scheduler",'width=400,height=200,toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,copyhistory=yes,resizable=yes');
  })
  
  
}