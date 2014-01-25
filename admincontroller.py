try:
    import JSON
except ImportError:
    import json as JSON
from functools import wraps
from flask import Flask, render_template, request, g, session, redirect, url_for
import json
import logging
import sqlalchemy.orm.exc
from datetime import *

from bootstrap import app,db
from models import SavedSchedule,SubjectData,SectionData,ErrorLog

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
    update=False
    insert=False

    obj=SubjectData.get_subject_data(code,session,sem)
    if(obj!=None):
        if(obj.coursetype==stype and
            obj.title==data['title'] and
            obj.credit==float(data['credit']) and
            obj.kuliyyah==kuly and
            obj.session==session and
            obj.semester==sem):
            pass
        else:
            obj.coursetype=stype
            obj.title=data['title']
            obj.credit=float(data['credit'])
            obj.kuliyyah=kuly
            obj.session=session
            obj.semester=sem
            obj.put()
            update=True
    else:
        obj=SubjectData()
        obj.code=code
        obj.coursetype=stype
        obj.title=data['title']
        obj.credit=float(data['credit'])
        obj.kuliyyah=kuly
        obj.session=session
        obj.semester=sem
        obj.put()
        insert=True

    sectionupdate=False
    sectioninsert=False


    for section in data['sections']:
        val=data['sections'][section]
        try:
            sdata=SectionData.query.filter(SectionData.subject==obj).filter(SectionData.sectionno==section).one()
            if(sdata.lecturer==val['lecturer'] and
                sdata.venue==val['venue'] and
                sdata.day==val['day'] and
                sdata.time==val['time']):
                pass
            else:
                sdata.lecturer=val['lecturer']
                sdata.venue=val['venue']
                sdata.day=val['day']
                sdata.time=val['time']
                sdata.put()
        except sqlalchemy.orm.exc.NoResultFound, e:
            sdata=SectionData()
            sdata.subject=obj
            sdata.sectionno=section
            sdata.lecturer=val['lecturer']
            sdata.venue=val['venue']
            sdata.day=val['day']
            sdata.time=val['time']
            sdata.put()

    logging.info("On subject %s using %s. %s section data %s. "%(code,update and 'update' or ( insert and 'add' or 'nothing') ,len(data['sections'].keys()),sectionupdate and 'updated' or ( sectioninsert and 'added' or 'nothing') ))

def update_subject_data_bulk(obj,session):
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

                update_subject_data_bulk(obj,session)

                message="File Uploaded. %s session data added/updated. "%g.counter
            else:
                message="Pick a file"
    return render_template( 'upload_section.html', message=message )

@app.route('/admin/remove_all_section_data/')
@login_required
def remove_section_data():
    query=SectionData.query
    for sd in query:
        sd.key.delete()
    return 'Done'

@app.route('/admin/error_report/<id>/delete/')
@login_required
def delete_error(id):
    error=ErrorLog.query.get(id)
    db.session.delete(error)
    db.session.commit()
    return redirect(url_for('error_report'))

@app.route('/admin/error_report/<id>/')
@login_required
def show_error(id):
    error=ErrorLog.query.get(id)
    return render_template('show_error.html',error=error)

@app.route('/admin/error_report/')
@login_required
def error_report():
    errors=ErrorLog.query
    return render_template('error_report_list.html',errors=errors)

