#! /usr/bin/python

from bootstrap import db, app
import datetime
from models import SavedSchedule

def cleanschedule():
    with app.test_request_context("/"):
        nowtime=datetime.datetime.now()
        nowtime=nowtime-datetime.timedelta(hours=12)

        thelist=SavedSchedule.all().filter(SavedSchedule.createddate < nowtime)
        thelist.delete('fetch')

        db.session.commit()
        return "Done"

if(__name__=="__main__"):
    cleanschedule()
