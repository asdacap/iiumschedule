from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column,Text,DateTime,Integer,String,Float,ForeignKey
from sqlalchemy.orm import relationship, backref

from bootstrap import db
DBBase=db.Model
class CMethods(object):

    @classmethod
    def get_by_key_name(cls,key):
        return db.session.query(cls).get(key)

    def put(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def all(cls):
        return db.session.query(cls)



class SavedSchedule(DBBase,CMethods):
    __tablename__='savedschedules'

    token=Column(String(150),primary_key=True)
    data=Column(Text)
    createddate=Column(DateTime)

class ErrorLog(DBBase,CMethods):
    __tablename__='errorlogs'

    id = Column(Integer, primary_key=True)
    submitter=Column(String(200))
    html=Column(Text)
    error=Column(Text)
    additionalinfo=Column(Text)
    created_at=Column(DateTime)

class SubjectData(DBBase,CMethods):
    __tablename__='subjectdatas'

    code=Column(String(20),primary_key=True)
    title=Column(String(200))
    credit=Column(Float)
    coursetype=Column(String(200))
    kuliyyah=Column(String(200))
    session=Column(String(200))
    semester=Column(Integer)

class SectionData(DBBase,CMethods):
    __tablename__='sectiondatas'

    id = Column(Integer, primary_key=True)
    sectionno = Column(Integer)
    code=Column(String(20),ForeignKey('subjectdatas.code'))
    lecturer=Column(String(200))
    venue=Column(String(200))
    day=Column(String(200))
    time=Column(String(200))

    subject=relationship("SubjectData",backref=backref('sections',cascade="all, delete-orphan"))

class Theme(DBBase,CMethods):
    __tablename__='themes'

    name=Column(String(250),primary_key=True)
    submitter=Column(String(250))
    email=Column(String(250))
    data=Column(Text)
    counter=Column(Integer)
    rendered=Column(Text)
