try:
    import JSON
except ImportError:
    import json as JSON
from functools import wraps
from flask import Flask, render_template, request, g, session, redirect, url_for
import json
import logging
from datetime import *

from bootstrap import app,db
from models import SavedSchedule,SubjectData,SectionData

from staticsettings import LOGIN_USERNAME,LOGIN_PASSWORD


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' in session and session['logged_in']==True:
            return f(*args, **kwargs)
        return redirect(url_for('login', next=request.url))
    return decorated_function

@app.route('/admin/logout/')
def logout(next=None):
    session['logged_in']=False
    return redirect(url_for('login'))

@app.route('/admin/login/',methods=['GET','POST'])
def login(next=None):
    if(request.method=='POST'):
        if(request.form['username']==LOGIN_USERNAME and request.form['password']==LOGIN_PASSWORD):
            session['logged_in']=True
            if(next==None):
                return redirect(url_for('adminmainpage'))
            return redirect(next)
    return render_template('login.html')


@app.route('/cleanschedule/')
@login_required
def cleanschedule():
    nowtime=datetime.now()
    nowtime=nowtime-timedelta(hours=12)
    thelist=SavedSchedule.all().filter("createddate <",nowtime)
    db.delete(thelist)
    return "Done"

@app.route('/admin/')
@login_required
def adminmainpage():
    return render_template( 'adminpage.html')

@app.route('/admin/reset_db/')
@login_required
def reset_db():
    db.drop_all()
    db.create_all()
    return "Done"

@app.route('/admin/create_db/')
@login_required
def create_db():
    db.create_all()
    return "Done"

def update_subject_data(session,sem,stype,kuly,code,data):
    update=False;
    insert=False

    query=list(SubjectData.query(SubjectData.code==code).fetch(1))
    if(len(query)):
        obj=query[0]
        if(obj.coursetype!=stype or obj.title != data['title'] or obj.credit!=float(data['credit']) or obj.kuliyyah!=kuly):
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
        insert=True

    sectionupdate=False
    sectioninsert=False

    query=list(SectionData.query(SectionData.session==session,SectionData.semester==int(sem),SectionData.code==code).fetch(1))
    if(len(query)):
        obj=query[0]
        if(obj.sectiondata!=data['sections']):
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
        sectioninsert=True

    logging.info("On subject %s using %s. %s section data %s. "%(code,update and 'update' or ( insert and 'add' or 'nothing') ,len(data['sections'].keys()),sectionupdate and 'updated' or ( sectioninsert and 'added' or 'nothing') ))


@app.route('/admin/upload_section_data/',methods=['GET','POST'])
@login_required
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
                                update_subject_data(session,sem,stype,kuly,code,results[sem][rstype][kuly][code])
                                g.counter+=1


                message="File Uploaded. %s session data added/updated. "%g.counter
            else:
                message="Pick a file"
    return render_template( 'upload_section.html', message=message )

@app.route('/admin/remove_all_section_data/')
@login_required
def remove_section_data():
    query=SectionData.query()
    for sd in query:
        sd.key.delete()
    return 'Done'
