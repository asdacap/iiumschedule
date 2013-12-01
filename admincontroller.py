from google.appengine.ext import webapp
from google.appengine.ext import db
import hashlib
import os
from datetime import datetime,timedelta
import re
try:
    import JSON
except ImportError:
    import json as JSON
from models import SavedSchedule

from flask import Flask, render_template, request
import json

app = Flask(__name__)

@app.route('/cleanschedule/')
def cleanschedule():
    nowtime=datetime.now()
    nowtime=nowtime-timedelta(hours=12)
    thelist=SavedSchedule.all().filter("createddate <",nowtime)
    db.delete(thelist)

@app.route('/admin/')
def adminmainpage():
    return render_template( 'adminpage.html')

@app.route('/admin/upload_section_data/',methods=['GET','POST'])
def update_section_data():
    message="Upload the section data"
    if(request.method=='POST'):
        if(request.files['secdata'].filename!=''):
            obj=json.load(request.files['secdata'])
            message="File Uploaded "+json.dumps(obj)
        else:
            message="Pick a file"
    return render_template( 'upload_section.html', message=message )
