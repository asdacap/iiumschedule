from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta

DEFAULTDATA='''
	      {"studentname":"FULANAH BINTI FUULAN","coursearray":[{"code":"IFF1454","section":"435","title":" COMPUTER HARDWARE AND TROUBLESHOOTING","credithour":"4","schedule":[{"day":"TUE","start":14,"end":16,"venue":"CS LAB E"},{"day":"THUR","start":10,"end":11,"venue":"CS LAB C"},{"day":"WED","start":11,"end":13,"venue":"ANNEX BUILDING AX205S"}]},{"code":"IFF1444","section":"405","title":"INTRODUCTION TO PROGRAMMING","credithour":"4","schedule":[{"day":"TUE","start":9,"end":11,"venue":"LY BUILDING LY024"},{"day":"FRI","start":10,"end":12,"venue":"ANNEX LAB COMP L5"},{"day":"WED","start":16,"end":17,"venue":"ANNEX LAB COMP L2"}]},{"code":"LQM1262","section":"401","title":" ELEMENTARY QURANIC LANGUAGE PART 2 (SCIENCES","credithour":"0","schedule":[{"day":"TUE","start":11,"end":13,"venue":" "},{"day":"MON","start":14,"end":16,"venue":" "},{"day":"THUR","start":16,"end":18,"venue":" "}]},{"code":"SFF1124","section":"411","title":"MATHEMATICS II","credithour":"4","schedule":[{"day":"WED","start":14,"end":16,"venue":"SMAWP2 S2120"},{"day":"MON","start":9,"end":11,"venue":"BLOCK E E122"},{"day":"FRI","start":9,"end":10,"venue":"SMAWP2 S2014"}]},{"code":"SHE1225","section":"405","title":"PHYSICS II","credithour":"5","schedule":[{"day":"TUE","start":16,"end":18,"venue":"ANNEX BUILDING AX206B"},{"day":"MON","start":11,"end":13,"venue":"SMAWP2 S2011"},{"day":"THUR","start":8,"end":10,"venue":"SMAWP2 S3124"}]}]};
'''

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class MainHandler(webapp.RequestHandler):
	def get(self):
	    self.response.headers.add_header("Access-Control-Allow-Origin","http://my.iium.edu.my")
	    path = os.path.join(os.path.dirname(__file__), 'scheduleformatterpage.html')
	    text=open(path).read()
	    
	    token=self.request.get("token",None)
	    if(not token):
	      data=DEFAULTDATA
	    else:
	      theinstance=SavedSchedule.get_by_key_name(token)
	      data=theinstance.data
	    
	    text=text+r"<script>var data="+data+";formatschedule();</script>"
	    self.response.out.write(text)
	def post(self):
	    thedata=self.request.get("data")
	    token=str(hashlib.md5(str(os.urandom(4))).hexdigest())
	    theschedule=SavedSchedule(key_name=token)
	    theschedule.data=thedata
	    theschedule.createddate=datetime.now()
	    theschedule.put()
	    self.response.headers.add_header("Access-Control-Allow-Origin","http://my.iium.edu.my")
	    self.response.out.write(token)
		
class CleanSchedule(webapp.RequestHandler):
	def get(self):
	    nowtime=datetime.now()
	    nowtime=nowtime-timedelta(hours=12)
	    thelist=SavedSchedule.all().filter("createddate <",nowtime)
	    db.delete(thelist)
		
application = webapp.WSGIApplication([('/scheduleformatter/', MainHandler),
				      ('/cleanschedule',CleanSchedule),],
				      debug=True)