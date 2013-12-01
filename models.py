from google.appengine.ext import db

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class ErrorLog(db.Model):
    submitter=db.StringProperty()
    html=db.TextProperty()
    error=db.TextProperty()
    additionalinfo=db.TextProperty()


