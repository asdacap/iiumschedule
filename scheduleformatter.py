from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
template2=template
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta
import recaptcha.client.captcha as recapt
recaptcha=recapt
try:
  import JSON
except ImportError:
  import json as JSON

DEFAULTDATA='''
{ "coursearray" : [ { "code" : "IFF1454",
        "credithour" : "4",
        "schedule" : [ { "day" : "TUE",
              "end" : 16,
              "start" : 14,
              "venue" : "CS LAB E"
            },
            { "day" : "THUR",
              "end" : 11,
              "start" : 10,
              "venue" : "CS LAB C"
            },
            { "day" : "WED",
              "end" : 13,
              "start" : 11,
              "venue" : "ANNEX BUILDING AX205S"
            }
          ],
        "section" : "435",
        "title" : " COMPUTER HARDWARE AND TROUBLESHOOTING"
      },
      { "code" : "IFF1444",
        "credithour" : "4",
        "schedule" : [ { "day" : "TUE",
              "end" : 11,
              "start" : 9,
              "venue" : "LY BUILDING LY024"
            },
            { "day" : "FRI",
              "end" : 12,
              "start" : 10,
              "venue" : "ANNEX LAB COMP L5"
            },
            { "day" : "WED",
              "end" : 17,
              "start" : 16,
              "venue" : "ANNEX LAB COMP L2"
            }
          ],
        "section" : "405",
        "title" : "INTRODUCTION TO PROGRAMMING"
      },
      { "code" : "LQM1262",
        "credithour" : "0",
        "schedule" : [ { "day" : "TUE",
              "end" : 13,
              "start" : 11,
              "venue" : "LY 013"
            },
            { "day" : "MON",
              "end" : 16,
              "start" : 14,
              "venue" : "SMWP2 S2135"
            },
            { "day" : "THUR",
              "end" : 18,
              "start" : 16,
              "venue" : "BLOCK E E014"
            }
          ],
        "section" : "401",
        "title" : " ELEMENTARY QURANIC LANGUAGE PART 2 (SCIENCES"
      },
      { "code" : "SFF1124",
        "credithour" : "4",
        "schedule" : [ { "day" : "WED",
              "end" : 16,
              "start" : 14,
              "venue" : "SMAWP2 S2120"
            },
            { "day" : "MON",
              "end" : 11,
              "start" : 9,
              "venue" : "BLOCK E E122"
            },
            { "day" : "FRI",
              "end" : 10,
              "start" : 9,
              "venue" : "SMAWP2 S2014"
            }
          ],
        "section" : "411",
        "title" : "MATHEMATICS II"
      },
      { "code" : "SHE1225",
        "credithour" : "5",
        "schedule" : [ { "day" : "TUE",
              "end" : 18,
              "start" : 16,
              "venue" : "ANNEX BUILDING AX206B"
            },
            { "day" : "MON",
              "end" : 13,
              "start" : 11,
              "venue" : "SMAWP2 S2011"
            },
            { "day" : "THUR",
              "end" : 10,
              "start" : 8,
              "venue" : "SMAWP2 S3124"
            }
          ],
        "section" : "405",
        "title" : "PHYSICS II"
      }
    ],
  "studentname" : "FULANAH BINTI FUULAN",
  "ic" : "930528016935",
  "matricnumber" : "163525",
  "program" : "ICT",
  "semester" : "3",
  "session" : "2011/2012",
}
'''

RECAPTCHA_KEY="6LeLrMwSAAAAABPhd2cea4eHthdl0e5HQZ1MmV58"
DEBUG=False

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
    rendered=db.TextProperty()
    
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
	    if(self.request.get("test")):
	      theinstance=SavedSchedule.get_by_key_name(token)
	      if(theinstance):
		self.response.out.write("true")
		return
	      else:
		self.response.out.write("false")
		return
	    path = os.path.join(os.path.dirname(__file__), 'scheduleloader.html')
	    self.response.out.write(template.render(path,{"token":token}))
		
class ScreenShot(webapp.RequestHandler):
	def get(self):
	    themename=self.request.get("themename",None)
	    if(not themename):
		self.response.out.write("No theme selected")
		return
	    themedata=Theme.get_by_key_name(themename)
	    if(themedata.rendered):
		self.response.out.write(themedata.rendered)
	    else:
		self.response.out.write("<h1>Sorry Thumbnail is not avalable</h1>")
		
application = webapp.WSGIApplication([('/scheduleformatter/', MainHandler),
				      ('/themegallery',ThemeHandler),
				      ('/scheduleloader',ScheduleLoader),
				      ('/screenshot',ScreenShot),
				      ('/cleanschedule',CleanSchedule),],
				      debug=True)