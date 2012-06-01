from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import re
import urllib2
import json
import random
from scheduleformatter import SavedSchedule
import string

FB_APP_ID='207943475977546'
FB_CLIENT_SECRET='31ed0d30f91d2a64ab3c0620370b52f6'

def generate_token():
    return ''.join(random.choice(string.letters) for i in xrange(5))

class FbscheduleSchedule(db.Model):
    fb=db.StringProperty()
    token=db.StringProperty()
    data=db.TextProperty()

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
        path = os.path.join(os.path.dirname(__file__), 'facebookschedule.html')
        self.response.out.write(template.render(path,{"data":schedule.data}))
        return

class FacebookRegister(webapp.RequestHandler):
    def get(self):
        state=self.request.get("state")
        if(self.request.get("error",None)):
            path = os.path.join(os.path.dirname(__file__), 'errorfacebookauth.html')
            self.response.out.write(template.render(path,{"token":state,"message":request.response.out.get("error_description")}))
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
            newfbrecord=FbscheduleSchedule()
            newfbrecord.data=scheddata
            newfbrecord.fb=data["id"]
            newfbrecord.token=generate_token()
            newfbrecord.put()
            self.redirect("/onfacebook/%s/%s/"%(newfbrecord.fb,newfbrecord.token))

application = webapp.WSGIApplication([  ('^/onfacebook/reg/?',FacebookRegister),
                                        ('^/onfacebook/[^/]*?/[^/]*?/?', MainHandler),
                                      ],
                                      debug=True)
