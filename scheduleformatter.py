from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class MainHandler(webapp.RequestHandler):
	def get(self):
	    self.response.headers.add_header("Access-Control-Allow-Origin","http://my.iium.edu.my")
	    token=self.request.get("token")
	    theinstance=SavedSchedule.get_by_key_name(token)
	    path = os.path.join(os.path.dirname(__file__), 'scheduleformatterpage.html')
	    text=open(path).read()
	    text=text+r"<script>var data="+theinstance.data+";formatschedule();</script>"
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