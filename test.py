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
import staticsettings
staticsettings.DB_CONN='sqlite:///:memory:'

import os
import app as iiumschedule
import bootstrap
from bootstrap import db,app
import unittest
import json
import flask
import datetime
import cgi

import models
import admincontroller
import mantainance
import json
import sqlalchemy.orm.session

class IIUMScheduleTestCase(unittest.TestCase):

    def setUp(self):
        iiumschedule.app.config['TESTING'] = True
        self.app = iiumschedule.app.test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def addSectionData(self):

        sd=models.SubjectData()
        sd.code='TQB 2011M'
        sd.title='TILAWAH AL-QURAN II'
        sd.credit=1
        sd.coursetype="ug"
        sd.kuliyyah="IRRELEVENT"
        sd.session="2013/2014"
        sd.semester="2"
        sd.put()

        ssd=models.SectionData()
        ssd.subject=sd
        ssd.lecturer="sample lecturer"
        ssd.venue="sample venue"
        ssd.day="sample day"
        ssd.time="sample time"
        ssd.sectionno=12
        ssd.put()


class ModelTestCase(IIUMScheduleTestCase):

    def testPostProcess(self):

        self.addSectionData()
        schedule=models.SavedSchedule()
        with open("testfixtures/samplejson.json") as f:
            schedule.data=f.read()
        schedule.post_process()

        assert "lecturer" in schedule.data
        assert "sample lecturer" in schedule.data

    def testSectionDataInput(self):

        with open("testfixtures/sectiondata.json") as f:
            obj=json.load(f)

        with bootstrap.app.test_request_context("/"):
            flask.g.counter=0

            admincontroller.update_subject_data_bulk(obj,"2013/2014")

            assert models.SubjectData.get_subject_data("CSC 4902","2013/2014",1)!=None
            assert models.SectionData.get_section_data("INFO 4501","2013/2014",1,2).lecturer=="ASSOC.PROF.DR. MOHAMAD FAUZAN BIN NOORDIN"

    def testCleanSchedule(self):

        schedule=models.SavedSchedule()
        schedule.data="random data"
        schedule.token="token1"
        schedule.createddate=datetime.datetime.now()
        schedule.put()

        schedule=models.SavedSchedule()
        schedule.data="random data"
        schedule.token="token2"
        schedule.createddate=datetime.datetime.now()-datetime.timedelta(hours=30)
        schedule.put()

        mantainance.cleanschedule()

        assert models.SavedSchedule.get_by_key_name("token1") != None

        assert models.SavedSchedule.get_by_key_name("token2") == None

    def testErrorLog(self):

        with bootstrap.app.test_request_context("/"):

            with self.app.session_transaction() as sess:
                sess['logged_in'] = True

            assert models.ErrorLog.query.count()==0

            res=self.app.post(flask.url_for('error_handler'),data={
                'submitter':'The submitter',
                'html':'<h1>Some stuff</h1>',
                'error':'The error',
                'add':'additional info',
            })
            assert 'Thank you for submitting a bug report' in res.data
            assert models.ErrorLog.query.count()==1

            res=self.app.get(flask.url_for('error_report'))
            assert 'The submitter' in res.data

            res=self.app.get(flask.url_for('show_error',id=models.ErrorLog.query.all()[0].id))
            assert '<h1>Some stuff</h1>' in res.data
            assert cgi.escape( '<h1>Some stuff</h1>' ) in res.data

            res=self.app.get(flask.url_for('delete_error',id=models.ErrorLog.query.all()[0].id))
            assert models.ErrorLog.query.count()==0

class ScheduleFormatterTestCase(IIUMScheduleTestCase):

    def setUp(self):
        super(ScheduleFormatterTestCase,self).setUp()

        samplejson = ''
        with open("testfixtures/samplejson.json") as f:
            samplejson = f.read()

        ss = models.SavedSchedule()
        ss.token="samplescheduletoken"
        ss.data=samplejson
        ss.createddate = datetime.datetime.now()
        ss.post_process()
        ss.put()
        self.saved_schedule = ss

    def testScheduleFormatter(self):
        resp = self.app.get('/scheduleformatter/')
        assert resp.status_code == 200

    def testScheduleFormatterNotExist(self):
        resp = self.app.get('/scheduleformatter/?dtype=completeschedule&token=notexist')
        assert resp.data == "Sorry, the requested schedule is no longer in the database. You should save it on your computer earlier."

    def testScheduleFormatterExist(self):
        resp = self.app.get('/scheduleformatter/?dtype=completeschedule&token='+self.saved_schedule.token)
        assert resp.data == self.saved_schedule.data

    def testScheduleFormatterUnformattedExist(self):
        resp = self.app.get('/scheduleformatter/?dtype=unformatted&token='+self.saved_schedule.token)
        assert resp.status_code == 200

    def testScheduleFormatterCreate(self):
        samplejson = ''
        with open("testfixtures/samplejson.json") as f:
            samplejson = f.read()
        resp = self.app.post('/scheduleformatter/',data={ 'data': samplejson })
        assert resp.status_code == 200
        token = resp.data
        ss = models.SavedSchedule.get_by_key_name(token)
        assert json.loads(ss.data)['studentname'] == json.loads(samplejson)['studentname']

    def testScheduleLoader(self):
        resp = self.app.get('/scheduleloader/?ctoken='+self.saved_schedule.token)
        assert resp.status_code == 200

    def testMain(self):
        resp = self.app.get('/')
        assert resp.status_code == 200

    def testErrorHandlerGet(self):
        resp = self.app.get('/error/')
        assert resp.status_code == 200

    def testErrorHandlerPost(self):
        beforecount = db.session.query(models.ErrorLog).count()
        resp = self.app.post('/error/',data={ 'html':'Some html','submitter':'someone', 'error':'Someerror' })
        assert resp.status_code == 200
        assert ( db.session.query(models.ErrorLog).count() - beforecount ) == 1

class AdminControllerTestCase(IIUMScheduleTestCase):

    def setUp(self):
        super(AdminControllerTestCase,self).setUp()
        self.app.post('/admin/login/',data={ 'username': staticsettings.LOGIN_USERNAME, 'password': staticsettings.LOGIN_PASSWORD })

    def testMainPage(self):
        resp = self.app.get('/admin/')
        assert resp.status_code == 200

    def testResetDB(self):
        resp = self.app.get('/admin/reset_db/')
        assert resp.status_code == 200

    def testCreateDB(self):
        resp = self.app.get('/admin/reset_db/')
        assert resp.status_code == 200

    def testUpdateSectionData(self):
        oricount = models.SubjectData.query.count()

        resp = self.app.post('/admin/upload_section_data/', data={
                'session':'2013/2014',
                'secdata':open('testfixtures/sectiondata.json')
            })

        assert resp.status_code == 200
        assert oricount < models.SubjectData.query.count()

    def testRemoveSectionData(self):
        self.addSectionData()
        assert models.SubjectData.query.count() != 0
        resp = self.app.get('/admin/remove_all_section_data/')
        assert resp.status_code == 200
        assert models.SubjectData.query.count() == 0



if __name__ == '__main__':
    unittest.main()
