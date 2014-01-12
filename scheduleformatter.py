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
from models import SavedSchedule, ErrorLog

from flask import Flask, render_template, request, g
import logging

app= Flask(__name__)

@app.route('/scheduleformatter/',methods=['GET','POST'])
def schedule_formatter():
    if(request.method=='GET'):
        dtype=request.args.get("dtype","unformatted")
        if(dtype=="completeschedule"):
            token=request.args.get("token",None)
            if(not token):
                return
            else:
                theinstance=SavedSchedule.get_by_key_name(token)
                if(theinstance==None):
                    return "Sorry, the requested schedule is no longer in the database. You should save it on your computer earlier."
                data=theinstance.data
                return data
            return
        path = os.path.join(os.path.dirname(__file__), 'scheduleformatterpage.html')
        text=open(path).read()

        token=request.args.get("token",None)
        if(not token):
            data=DEFAULTDATA
        else:
            theinstance=SavedSchedule.get_by_key_name(token)
            if(theinstance==None):
                return "Sorry, the requested schedule is no longer in the database. You should save it on your computer earlier."
            data=theinstance.data

        header={"Access-Control-Allow-Origin":"http://my.iium.edu.my"}
        text=text+r"<script>var data="+data+";formatschedule();</script>"
        return text,200,header
    else:
        thedata=request.form.get("data")
        customtoken=request.form.get("custom",False)
        if not customtoken:
            token=str(hashlib.md5(str(os.urandom(4))).hexdigest())
        else:
            token=request.form.get("ctoken")
        theschedule=SavedSchedule(key_name=token)
        theschedule.data=thedata
        theschedule.createddate=datetime.now()
        theschedule.put()
        header={"Access-Control-Allow-Origin":"http://my.iium.edu.my"}
        return token,200,header

@app.route('/scheduleloader/')
def schedule_loader():
    token=request.args.get("ctoken")
    isfacebook=request.args.get("facebook",False)
    if(request.args.get("test")):
        theinstance=SavedSchedule.get_by_key_name(token)
        if(theinstance):
            return "true"
        else:
            return "false"
    if(isfacebook):
        path = os.path.join(os.path.dirname(__file__), 'facebookloader.html')
    else:
        path = os.path.join(os.path.dirname(__file__), 'scheduleloader.html')
    return template.render(path,{"token":token})

@app.route('/error/',methods=['GET','POST'])
def error_handler():
    submitter=request.form.get("submitter")
    html=request.form.get("html")
    additionaldata=request.form.get("add")
    newrecord=ErrorLog()
    newrecord.submitter=submitter
    newrecord.html=html
    newrecord.error=request.form.get("error")
    newrecord.additionalinfo=additionaldata
    newrecord.put()
    return "Thank you for submitting a bug report. I will take some time before I read this error, and take more time before I fix it. So... just be patient."

@app.route('/')
def main():
    path = os.path.join(os.path.dirname(__file__), 'mainpage.html')
    return open(path).read()

