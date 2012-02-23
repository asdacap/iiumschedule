from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
template2=template
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta
import recaptcha.client as recapt
try:
  import JSON
except ImportError:
  import json as JSON

DEFAULTDATA='''
	      {"studentname":"FULANAH BINTI FUULAN","coursearray":[{"code":"IFF1454","section":"435","title":" COMPUTER HARDWARE AND TROUBLESHOOTING","credithour":"4","schedule":[{"day":"TUE","start":14,"end":16,"venue":"CS LAB E"},{"day":"THUR","start":10,"end":11,"venue":"CS LAB C"},{"day":"WED","start":11,"end":13,"venue":"ANNEX BUILDING AX205S"}]},{"code":"IFF1444","section":"405","title":"INTRODUCTION TO PROGRAMMING","credithour":"4","schedule":[{"day":"TUE","start":9,"end":11,"venue":"LY BUILDING LY024"},{"day":"FRI","start":10,"end":12,"venue":"ANNEX LAB COMP L5"},{"day":"WED","start":16,"end":17,"venue":"ANNEX LAB COMP L2"}]},{"code":"LQM1262","section":"401","title":" ELEMENTARY QURANIC LANGUAGE PART 2 (SCIENCES","credithour":"0","schedule":[{"day":"TUE","start":11,"end":13,"venue":" "},{"day":"MON","start":14,"end":16,"venue":" "},{"day":"THUR","start":16,"end":18,"venue":" "}]},{"code":"SFF1124","section":"411","title":"MATHEMATICS II","credithour":"4","schedule":[{"day":"WED","start":14,"end":16,"venue":"SMAWP2 S2120"},{"day":"MON","start":9,"end":11,"venue":"BLOCK E E122"},{"day":"FRI","start":9,"end":10,"venue":"SMAWP2 S2014"}]},{"code":"SHE1225","section":"405","title":"PHYSICS II","credithour":"5","schedule":[{"day":"TUE","start":16,"end":18,"venue":"ANNEX BUILDING AX206B"},{"day":"MON","start":11,"end":13,"venue":"SMAWP2 S2011"},{"day":"THUR","start":8,"end":10,"venue":"SMAWP2 S3124"}]}]};
'''

RECAPTCHA_KEY=""
DEBUG=True

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class Theme(db.Model):
    name=db.StringProperty()
    submitter=db.StringProperty()
    email=db.StringProperty()
    style=db.TextProperty()
    template=db.TextProperty()
    counter=db.IntegerProperty()
    
import re
    
class ThemeHandler(webapp.RequestHandler):
	def get(self):
	    if(self.request.get("submit",None)):
	      path = os.path.join(os.path.dirname(__file__), 'submittheme.html')
	      self.response.out.write(template.render(path,{}))
	    elif(self.request.get("name",None)):
	      themename=self.request.get("name")
	      themedata=Theme.get_by_key_name(themename)
	      thedict=dict()
	      thedict["name"]=themedata.name
	      thedict["submitter"]=themedata.submitter
	      thedict["email"]=themedata.email
	      thedict["style"]=themedata.style
	      thedict["template"]=themedata.template
	      self.response.out.write(JSON.dumps(thedict))
	    else:
	      themelist=Theme.all()
	      path = os.path.join(os.path.dirname(__file__), 'themegallery.html')
	      self.response.out.write(template.render(path,{"themes":themelist}))
	    
	def post(self):
	    error=False
	    errormessage=None
	    themename=self.request.get("name")
	    submitter=self.request.get("submitter",None)
	    template=self.request.get("template",None)
	    style=self.request.get("style",None)
	    email=self.request.get("email",None)
	    if(not error):
	      if(themename==None):
		error=True
		errormessage="You must enter a theme name"
	    if(not error):
	      recaptchallange=self.request.get("recaptcha_challange_field")
	    if(not error):
	      recaptresponse=self.request.get("recaptcha_response_field")
	    if(not error):
	      if(submitter==None or submitter==""):
		error=True
		errormessage="Please enter your name"
	    if(not error):
	      if(email==None or email==""):
		error=True
		errormessage="Please enter your email"
	      if(not error and not re.match(r"[^@]+@[^@]+\.[^@]+",email)):
		error=True
		errormessage="Please enter a valid email address"
		
	    if(not error):
	      if(style==None or style==""):
		error=True
		errormessage="The style must not be empty"
	    if(not error):
	      if(template==None or style==""):
		error=True
		errormessage="The template must not be empty"
	    if(not DEBUG):
	      validation=recaptcha.submit(recaptchallange,recaptresponse,RECAPTCHA_KEY)
	      if(not validation.is_valid):
		error=True
		errormessage="Please reenter the recaptcha."
	    if((DEBUG or validation.is_valid) and not error):
	      newtheme=Theme(key_name=themename)
	      newtheme.name=themename
	      newtheme.submitter=submitter
	      newtheme.email=email
	      newtheme.style=style
	      newtheme.template=template
	      newtheme.counter=0
	      newtheme.put()
	      self.response.out.write(open(os.path.join(os.path.dirname(__file__), 'thankmessage.html')).read())
	    elif(not error):
	      self.response.set_status(403)
	    else:
	      arg=dict()
	      arg["name"]=themename
	      arg["submitter"]=submitter
	      arg["email"]=email
	      arg["style"]=style
	      arg["template"]=template
	      arg["message"]=errormessage
	      path = os.path.join(os.path.dirname(__file__), 'submittheme.html')
	      self.response.out.write(template2.render(path,arg))
	      
    
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
				      ('/themegallery',ThemeHandler),
				      ('/cleanschedule',CleanSchedule),],
				      debug=True)