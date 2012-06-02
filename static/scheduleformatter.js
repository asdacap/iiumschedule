
var counter=0;
var complete_count=2;
function res_add_counter(){
	counter=counter+1;
	if(counter==complete_count){
		parsetable();
	}
}

function startscheduler(){
  var e=document.createElement('div');
  e.setAttribute('id','iiumschedulediv');
  e.setAttribute('style','width:100%;text-align:center;margin-top:10px;')
  e.innerHTML='Loading additional resource...'
  document.getElementsByTagName('body')[0].appendChild(e); 
  
  e=document.createElement('script');
  e.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
  e.type='text/javascript';
  e.addEventListener('load', res_add_counter )
  document.getElementsByTagName('head')[0].appendChild(e); 
  
  e=document.createElement('script');
  e.src = 'http://iiumschedule.appspot.com/static/scheduleformatter2.js';
  e.type='text/javascript';
  e.addEventListener('load', res_add_counter )
  document.getElementsByTagName('head')[0].appendChild(e); 
  
}
