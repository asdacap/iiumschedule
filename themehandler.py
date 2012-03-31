
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
template2=template
import re
from google.appengine.ext import db
import recaptcha.client.captcha as recapt
recaptcha=recapt
from staticsettings import RECAPTCHA_KEY,DEBUG
try:
  import JSON
except ImportError:
  import json as JSON


class Theme(db.Model):
    name=db.StringProperty()
    submitter=db.StringProperty()
    email=db.StringProperty()
    style=db.TextProperty()
    template=db.TextProperty()
    counter=db.IntegerProperty()
    rendered=db.TextProperty()
    
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
	    rendered=self.request.get("rendered",None)
	    if(not error):
	      if(themename==None):
		error=True
		errormessage="You must enter a theme name"
	    if(not error):
	      recaptchallange=self.request.get("recaptcha_challenge_field")
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
	      validation=recaptcha.submit(recaptchallange,recaptresponse,RECAPTCHA_KEY,self.request.remote_addr)
	      if(not validation.is_valid):
		error=True
		errormessage="Please reenter the recaptcha."+str(validation.error_code)+" challange="+recaptchallange+" response="+recaptresponse
	    if((DEBUG or validation.is_valid) and not error):
	      newtheme=Theme(key_name=themename)
	      newtheme.name=themename
	      newtheme.submitter=submitter
	      newtheme.email=email
	      newtheme.style=style
	      newtheme.template=template
	      newtheme.counter=0
	      newtheme.rendered=rendered
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
	      arg["rendered"]=rendered
	      path = os.path.join(os.path.dirname(__file__), 'submittheme.html')
	      self.response.out.write(template2.render(path,arg))
		
class ScreenShot(webapp.RequestHandler):
	def get(self):
	    themename=self.request.get("themename",None)
	    if(not themename):
		self.response.set_status(404,"No theme selected.")
		self.response.out.write("No theme selected")
		return
	    themedata=Theme.get_by_key_name(themename)
	    if(not themedata):
		self.response.set_status(404,"The theme '"+themename+"' does not exist.")
		self.response.out.write("The theme '"+themename+"' does not exist.")
		return
	    if(themedata.rendered):
		self.response.out.write(themedata.rendered)
	    else:
		self.response.out.write("<h1>Sorry Thumbnail is not avalable</h1>")
		
application = webapp.WSGIApplication([
				      ('/themegallery',ThemeHandler),
				      ('/screenshot',ScreenShot),
				      ],
				      debug=True)