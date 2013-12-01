from google.appengine.ext import ndb as db

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class ErrorLog(db.Model):
    submitter=db.StringProperty()
    html=db.TextProperty()
    error=db.TextProperty()
    additionalinfo=db.TextProperty()

class SubjectData(db.Model):
    code=db.StringProperty(required=True)
    title=db.StringProperty(required=True)
    credit=db.FloatProperty(required=True)
    coursetype=db.StringProperty(required=True,choices=['UG','PG'])
    kuliyyah=db.StringProperty(required=True)

class SectionData(db.Model):
    session=db.StringProperty(required=True)
    semester=db.IntegerProperty(required=True)
    code=db.StringProperty(required=True)
    sectiondata=db.JsonProperty(required=True)
