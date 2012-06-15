from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta
import re
try:
    import JSON
except ImportError:
    import json as JSON
from staticsettings import DEFAULTDATA


class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()
    
class MainHandler(webapp.RequestHandler):
    def get(self):
        dtype=self.request.get("dtype","unformatted")
        if(dtype=="completeschedule"):
            token=self.request.get("token",None)
            if(not token):
                return
            else:
                theinstance=SavedSchedule.get_by_key_name(token)
                data=theinstance.data
            self.response.write(data)
            return
        self.response.headers.add_header("Access-Control-Allow-Origin","http://my.iium.edu.my")
        path = os.path.join(os.path.dirname(__file__), 'scheduleformatterpage.html')
        text=open(path).read()
        
        token=self.request.get("token",None)
        if(not token):
            data=DEFAULTDATA
        else:
            theinstance=SavedSchedule.get_by_key_name(token)
            if(theinstance==None):
                self.response.out.write("Sorry, the requested schedule is no longer in the database. You should save it on your computer earlier.")
                return
            data=theinstance.data
          
        text=text+r"<script>var data="+data+";formatschedule();</script>"
        self.response.out.write(text)
    def post(self):
        thedata=self.request.get("data")
        customtoken=self.request.get("custom",False)
        if not customtoken:
            token=str(hashlib.md5(str(os.urandom(4))).hexdigest())
        else:
            token=self.request.get("ctoken")
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
            
class ScheduleLoader(webapp.RequestHandler):
    def get(self):
        token=self.request.get("ctoken")
        isfacebook=self.request.get("facebook",False)
        if(self.request.get("test")):
            theinstance=SavedSchedule.get_by_key_name(token)
            if(theinstance):
                self.response.out.write("true")
                return
            else:
                self.response.out.write("false")
                return
        if(isfacebook):
            path = os.path.join(os.path.dirname(__file__), 'facebookloader.html')
        else:
            path = os.path.join(os.path.dirname(__file__), 'scheduleloader.html')
        self.response.out.write(template.render(path,{"token":token}))
            
class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'mainpage.html')
        self.response.out.write(open(path).read())
            
application = webapp.WSGIApplication([('/scheduleformatter/', MainHandler),
                                      ('/scheduleloader',ScheduleLoader),
                                      ('/cleanschedule',CleanSchedule),
                                      ('/',MainPage),],
                                      debug=False)
