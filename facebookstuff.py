from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import re
import urllib2
import urllib
import json
import random
from scheduleformatter import SavedSchedule
import string
from datetime import datetime,timedelta
from google.appengine.api import conversion
import httplib
import google.appengine.api.urlfetch as urlfetch
from autocrop import autocrop_image

FB_APP_ID='207943475977546'
FB_CLIENT_SECRET='31ed0d30f91d2a64ab3c0620370b52f6'

def generate_token():
    return ''.join(random.choice(string.letters) for i in xrange(5))

class FbscheduleSchedule(db.Model):
    fb=db.StringProperty()
    token=db.StringProperty()
    data=db.BlobProperty()
    createddate=db.DateTimeProperty()

detregex=re.compile(r'^/onfacebook/([^/]*?)/([^/]*?)/?$')
def get_sched_detail(path):
    match=detregex.search(path)
    if(match):
        return (match.group(1),match.group(2))
    return None

hastokenregex=re.compile(r'^/onfacebook/([^/]*?)/?$')
def no_token(path):
    match=hastokenregex.search(path)
    if(match):
        return match.group(1)
    return None

class MainHandler(webapp.RequestHandler):
    def get(self):
        fbid=no_token(self.request.path)
        if(fbid):
            query=FbscheduleSchedule.all().filter("fb =",fbid)
            path = os.path.join(os.path.dirname(__file__), 'schedlist.html')
            self.response.out.write(template.render(path,{"fbid":fbid,"query":query}))
            return
        details=get_sched_detail(self.request.path)
        if(details==None):
            path = os.path.join(os.path.dirname(__file__), 'missingfacebook.html')
            self.response.out.write(template.render(path,{}))
            return
        fbid=details[0]
        token=details[1]
        schedule=FbscheduleSchedule.all().filter("token =",token).filter("fb =",fbid).get()
        #what happen if it return None?
        self.response.headers['Content-Type'] = "image/png"
        self.response.out.write(schedule.data)
        return

class FacebookRegister(webapp.RequestHandler):
    def get(self):
        state=self.request.get("state")
        if(self.request.get("error",None)):
            path = os.path.join(os.path.dirname(__file__), 'errorfacebookauth.html')
            self.response.out.write(template.render(path,{"token":state,"message":self.request.out.get("error_description")}))
            return
        code=self.request.get("code")
        requesturl="https://graph.facebook.com/oauth/access_token?client_id="+FB_APP_ID+\
                    "&redirect_uri=https%3A%2F%2Fiiumschedule.appspot.com%2Fonfacebook%2Freg%2F"+\
                    "&client_secret="+FB_CLIENT_SECRET+\
                    "&code="+code
        response=urllib2.urlopen(requesturl)
        response=response.read()
        if(re.search(r'^{.*}$',response)):
            obj=json.loads(response)
            path = os.path.join(os.path.dirname(__file__), 'errorfacebookauth.html')
            self.response.out.write(template.render(path,{"token":state,"message":obj["error"]["message"]}))
            return
        match=re.search(r'^access_token=([^&]*)&',response)
        if(match):
            token=match.group(1)
            #get fbdata
            data=urllib2.urlopen("https://graph.facebook.com/me?access_token="+token)
            data=data.read()
            #TODO check if failed
            data=json.loads(data)
            #get the schedule, put them in a new fbrecord, redirect to it.
            theschedule=SavedSchedule.get_by_key_name(state)
            if(not theschedule):
                self.response.out.write("Sorry, an error occured. The schedule is no longer in the database.")
                return
            scheddata=theschedule.data
            #convert data to picture.
            htmldata=conversion.Asset("text/html",scheddata,"index.html")
            converter=conversion.Conversion(htmldata,"image/png",image_width=2000,last_page=2)
            result=conversion.convert(converter)
            if(not result.assets):
                self.response.out.write("Conversion error")
                return
            scheddata=result.assets[0].data
            scheddata=autocrop_image(scheddata)

            newfbrecord=FbscheduleSchedule()
            newfbrecord.data=scheddata
            newfbrecord.fb=data["id"]
            newfbrecord.token=generate_token()
            newfbrecord.createddate=datetime.now()
            newfbrecord.put()

            #post picture to facebook
            arg={}
            arg["url"]="http://iiumschedule.appspot.com/onfacebook/%s/%s/"%(newfbrecord.fb,newfbrecord.token)
            theurl=arg["url"]
            arg["access_token"]=token
            arg["message"]="Schedule generated at http://iiumschedule.appspot.com/"
            arg=urllib.urlencode(arg)
            try:
                response=urlfetch.fetch("https://graph.facebook.com/"+str(newfbrecord.fb)+"/photos/",arg,method=urlfetch.POST,headers={'Content-Type': 'application/x-www-form-urlencoded'},deadline=20)
                response=response.content
                if(re.search(r'^{.*}$',response)):
                    oldtext=response
                    response=json.loads(response)
                    if(not hasattr(response,"id")):
                        self.response.out.write("Error->"+oldtext+"\n The image url is <a href='%s'>%s</a>"%(theurl,theurl));
                        return
                    theid=response['id']
                    self.redirect("http://www.facebook.com/"+str(theid))
                    return
                self.response.out.write("Error->"+response)
            except httplib.HTTPException as e:
                self.response.out.write("Error->"+str(e))
                self.response.out.write("The url="+theurl)
                
class CleanSchedule(webapp.RequestHandler):
    def get(self):
        nowtime=datetime.now()
        nowtime=nowtime-timedelta(hours=12)
        thelist=FbscheduleSchedule.all().filter("createddate <",nowtime)
        db.delete(thelist)

application = webapp.WSGIApplication([  ('^/onfacebook/reg/?',FacebookRegister),
                                        ('/onfacebook/clean/',CleanSchedule),
                                        ('^/onfacebook/[^/]*?/[^/]*?/?', MainHandler),
                                      ],
                                      debug=True)
