import staticsettings
staticsettings.DB_CONN='sqlite:///:memory:'

import os
import app as iiumschedule
import bootstrap
import unittest

import models

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

if __name__ == '__main__':
    unittest.main()
