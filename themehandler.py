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
import os
import re
import recaptcha.client.captcha as recapt
recaptcha=recapt
from staticsettings import RECAPTCHA_KEY,RECAPTCHA_PUBLIC_KEY,DEBUG,DEFAULTDATA
try:
    import JSON
except ImportError:
    import json as JSON
import logging

from flask import url_for,request,render_template
from bootstrap import app
from models import Theme

def list_themes():
    if(request.args.get("submit",None)):
        arg={}
        arg["RECAPTCHA_PUBLIC_KEY"]=RECAPTCHA_PUBLIC_KEY
        arg["RECAPTCHA_KEY"]=RECAPTCHA_KEY
        return render_template('submittheme.html',**arg)
    elif(request.args.get("name",None)):
        themename=request.args.get("name")
        themedata=Theme.get_by_key_name(themename)
        if(themedata==None):
            return 'Theme not found',404
        thedict=dict()
        thedict["name"]=themedata.name
        thedict["submitter"]=themedata.submitter
        thedict["email"]=themedata.email
        thedict["data"]=JSON.loads(themedata.data)
        return JSON.dumps(thedict)
    else:
        themelist=Theme.all()
        return render_template( 'themegallery.html' , themes=themelist)

def save_theme():
    error=False
    errormessage=None
    themename=request.form.get("name")
    submitter=request.form.get("submitter",None)
    template=request.form.get("template",None)
    data=request.form.get("data",None)
    email=request.form.get("email",None)
    rendered=request.form.get("rendered",None)

    if(not error):
        if(themename==None):
            error=True
            errormessage="You must enter a theme name"

    if(not error):
        recaptchallange=request.form.get("recaptcha_challenge_field")

    if(not error):
        recaptresponse=request.form.get("recaptcha_response_field")

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
        if(data==None or data==""):
            error=True
            errormessage="The no data found"

    if(not error):
        themedata=Theme.get_by_key_name(themename)
        if(themedata):
            error=True
            errormessage="A theme with the same name already exist"

    if(not DEBUG):
        validation=recaptcha.submit(recaptchallange,recaptresponse,RECAPTCHA_KEY,request.remote_addr)
        if(not validation.is_valid):
            error=True
            errormessage="Please reenter the recaptcha."+str(validation.error_code)+" challange="+recaptchallange+" response="+recaptresponse

    if((DEBUG or validation.is_valid) and not error):
        newtheme=Theme()
        newtheme.name=themename
        newtheme.submitter=submitter
        newtheme.email=email
        newtheme.data=data
        newtheme.counter=0
        newtheme.rendered=rendered
        newtheme.put()
        return render_template('thankmessage.html')
    elif(not error):
        return 'Something went wrong',400
    else:
        arg=dict()
        arg["name"]=themename
        arg["submitter"]=submitter
        arg["email"]=email
        arg["data"]=data
        arg["message"]=errormessage
        arg["rendered"]=rendered
        arg["RECAPTCHA_PUBLIC_KEY"]=RECAPTCHA_PUBLIC_KEY
        arg["RECAPTCHA_KEY"]=RECAPTCHA_KEY
        return render_template('submittheme.html',**arg)

@app.route('/themegallery/',methods=['GET','POST'])
def themegallery():
    if(request.method=='GET'):
        return list_themes()
    elif(request.method=='POST'):
        return save_theme()

@app.route('/screenshot/')
def screenshot():
    themename=request.args.get("themename",None)
    if(not themename):
        return 'No theme selected',404
    themedata=Theme.get_by_key_name(themename)
    if(not themedata):
        return "The theme '"+themename+"' does not exist.",404
    if(themedata.rendered):
        return themedata.rendered
    else:
        return "<h1>Sorry Thumbnail is not avalable</h1>"

@app.route('/defaultdata/')
def defaultdata():
    return DEFAULTDATA
