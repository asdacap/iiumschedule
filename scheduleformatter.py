'''
Copyright (C) 2014 Muhd Amirul Ashraf bin Mohd Fauzi <asdacap@gmail.com>

This file is part of Automatic IIUM Schedule Formatter.

Automatic IIUM Schedule Formatter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Automatic IIUM Schedule Formatter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Automatic IIUM Schedule Formatter.  If not, see <http://www.gnu.org/licenses/>.
'''
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
from bootstrap import app

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

        text=render_template('scheduleformatterpage.html')

        token=request.args.get("token",None)
        if(not token):
            data=DEFAULTDATA
        else:
            theinstance=SavedSchedule.get_by_key_name(token)
            if(theinstance==None):
                return "Sorry, the requested schedule is no longer in the database. You should save it on your computer earlier."
            data=theinstance.data

        header={"Access-Control-Allow-Origin":"http://my.iium.edu.my"}
        text=text+r"<script>var data="+data+"</script>"
        return text,200,header
    else:
        thedata=request.form.get("data")
        customtoken=request.form.get("custom",False)
        if not customtoken:
            token=str(hashlib.md5(str(os.urandom(4))).hexdigest())
        else:
            token=request.form.get("ctoken")
        theschedule=SavedSchedule(token=token)
        theschedule.data=thedata
        theschedule.createddate=datetime.now()
        if(request.form.get("no_post_process","0")!="1"):
            theschedule.post_process()
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
        path = 'facebookloader.html'
    else:
        path = 'scheduleloader.html'
    return render_template(path,token=token)

@app.route('/error/',methods=['GET','POST'])
def error_handler():
    if(request.method=='POST'):
        submitter=request.form.get("submitter")
        html=request.form.get("html")
        additionaldata=request.form.get("add")
        newrecord=ErrorLog()
        newrecord.submitter=submitter
        newrecord.html=html
        newrecord.error=request.form.get("error")
        newrecord.additionalinfo=additionaldata
        newrecord.created_at=datetime.now()
        newrecord.put()
        return "Thank you for submitting a bug report. I will take some time before I read this error, and take more time before I fix it. So... just be patient."
    return render_template('error_form.html')

@app.route('/')
def main():
    return render_template('mainpage.html')

