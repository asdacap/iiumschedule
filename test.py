import staticsettings
staticsettings.DB_CONN='sqlite:///:memory:'

import os
import app as iiumschedule
import bootstrap
import unittest
import json
import flask
import datetime
import cgi

import models
import admincontroller
import mantainance

class IIUMSchedulTestCase(unittest.TestCase):

    def setUp(self):
        iiumschedule.app.config['TESTING'] = True
        self.app = iiumschedule.app.test_client()
        bootstrap.db.create_all()

    def tearDown(self):
        bootstrap.db.drop_all()

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

if __name__ == '__main__':
    unittest.main()
