import hashlib
import os
import re
try:
    import JSON
except ImportError:
    import json as JSON
from models import SavedSchedule,SubjectData,SectionData

from flask import Flask, render_template, request, g
import json
import logging
from google.appengine.ext import deferred

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

def update_subject_data(session,sem,stype,kuly,code,data):
    update=False;
    query=list(SubjectData.query(SubjectData.code==code).fetch(1))
    if(len(query)):
        obj=query[0]
        obj.coursetype=stype
        obj.title=data['title']
        obj.credit=float(data['credit'])
        obj.kuliyyah=kuly
        obj.put()
        update=True
    else:
        obj=SubjectData()
        obj.code=code
        obj.coursetype=stype
        obj.title=data['title']
        obj.credit=float(data['credit'])
        obj.kuliyyah=kuly
        obj.put()

    sectionupdate=False
    query=list(SectionData.query(SectionData.session==session,SectionData.semester==int(sem),SectionData.code==code).fetch(1))
    if(len(query)):
        obj=query[0]
        obj.sectiondata=data['sections']
        obj.put()
        sectionupdate=True
    else:
        obj=SectionData()
        obj.session=session
        obj.semester=int(sem)
        obj.code=code
        obj.sectiondata=data['sections']
        obj.put()

    logging.info("On subject %s using %s. %s section data %s. "%(code,update and 'update' or 'add',len(data['sections'].keys()),sectionupdate and 'updated' or 'added'))


@app.route('/admin/upload_section_data/',methods=['GET','POST'])
def update_section_data():
    message="Upload the section data"
    if(request.method=='POST'):
        if(request.form['session'].strip()==''):
            message="Please enter a valid session"
        else:
            g.counter=0

            session=request.form['session']
            if(request.files['secdata'].filename!=''):
                obj=json.load(request.files['secdata'])

                results=obj['results']

                for sem in results:
                    for rstype in results[sem]:
                        if(rstype=='<'):
                            stype='UG'
                        else:
                            stype='PG'
                        for kuly in results[sem][rstype]:
                            for code in results[sem][rstype][kuly]:
                                deferred.defer(update_subject_data,session,sem,stype,kuly,code,results[sem][rstype][kuly][code])
                                #update_subject_data(session,sem,stype,kuly,code,results[sem][rstype][kuly][code])
                                g.counter+=1


                message="File Uploaded. %s deferred task created. "%g.counter
            else:
                message="Pick a file"
    return render_template( 'upload_section.html', message=message )
