from google.appengine.ext import ndb, db

class SavedSchedule(db.Model):
    data=db.TextProperty()
    createddate=db.DateTimeProperty()

class ErrorLog(db.Model):
    submitter=db.StringProperty()
    html=db.TextProperty()
    error=db.TextProperty()
    additionalinfo=db.TextProperty()

class SubjectData(ndb.Model):
    code=ndb.StringProperty(required=True)
    title=ndb.StringProperty(required=True)
    credit=ndb.FloatProperty(required=True)
    coursetype=ndb.StringProperty(required=True,choices=['UG','PG'])
    kuliyyah=ndb.StringProperty(required=True)

class SectionData(ndb.Model):
    session=ndb.StringProperty(required=True)
    semester=ndb.IntegerProperty(required=True)
    code=ndb.StringProperty(required=True)
    sectiondata=ndb.JsonProperty(required=True)
