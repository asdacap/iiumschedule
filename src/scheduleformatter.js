

function startscheduler(){
	var counter = 0;
	function res_add_counter(){
		counter = counter+1;
		if(counter==complete_count){
			start();
		}
	}
	var e = document.createElement('div');
	e.setAttribute('id','iiumschedulediv');
	e.setAttribute('style','width:100%;text-align:center;margin-top:10px;');
	e.innerHTML = 'Loading additional resource...';
	document.getElementsByTagName('body')[0].appendChild(e); 
	  
    var scripts = [
    'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
    'http://iiumschedule.asdacap.com/static/js/underscore-min.js',
    'http://iiumschedule.asdacap.com/static/scheduleformatter2.js'
    ];
	var complete_count = scripts.length;

    for(var i = 0;i<scripts.length;i++){
        e = document.createElement('script');
        e.src = scripts[i];
        e.type = 'text/javascript';
        e.addEventListener('load', res_add_counter );
        document.getElementsByTagName('head')[0].appendChild(e); 
    }
}
