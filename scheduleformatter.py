from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template

class MainHandler(webapp.RequestHandler):
	def get(self):
	    self.response.headers.add_header("Access-Control-Allow-Origin","http://my.iium.edu.my")
	    thedata={"Hi":0}
	    path = os.path.join(os.path.dirname(__file__), 'scheduleformatterpage.html')
	    self.response.out.write(template.render(path,thedata))
		
application = webapp.WSGIApplication([('/scheduleformatter/', MainHandler)],
				      debug=True)