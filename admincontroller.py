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
from scheduleformatter import SavedSchedule

class CleanSchedule(webapp.RequestHandler):
    def get(self):
        nowtime=datetime.now()
        nowtime=nowtime-timedelta(hours=12)
        thelist=SavedSchedule.all().filter("createddate <",nowtime)
        db.delete(thelist)

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'adminpage.html')
        self.response.out.write(open(path).read())

application = webapp.WSGIApplication([
                                      ('/cleanschedule',CleanSchedule),
                                      ('/admin/?',MainPage),],
                                      debug=False)
