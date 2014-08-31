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
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column,Text,DateTime,Integer,String,Float,ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.schema import UniqueConstraint
import sqlalchemy.orm.exc
import json
import re
import tempfile
import subprocess
import os
import os.path

from bootstrap import db,app
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

    def post_process(self):
        #add section data
        self.data=self.data.replace(unichr(160)," ")
        obj=json.loads(self.data)
        for s in obj['coursearray']:
            s['lecturer']=''

        if(obj['scheduletype']!='MAINCAMPUS'):
            #we have no data other than main campus data but we still need to format it
            self.data=json.dumps(obj)
            return

        for s in obj['coursearray']:
            sectiondata=SectionData.get_section_data(s['code'],obj['session'],obj['semester'],s['section'])
            if(sectiondata==None):
                app.logger.warning('Warning, no section data for %s session %s semester %s section %s'%(s['code'],obj['session'],obj['semester'],s['section']))
            else:
                s['lecturer']=sectiondata.lecturer

        self.data=json.dumps(obj)


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
    __table_args__= (
        UniqueConstraint('code','session','semester'),
    )

    id = Column(Integer, primary_key=True)
    code=Column(String(20))
    title=Column(String(200))
    credit=Column(Float)
    coursetype=Column(String(200))
    kuliyyah=Column(String(200))
    session=Column(String(200))
    semester=Column(Integer)

    @classmethod
    def get_subject_data(cls,code,session,semester):
        try:
            return cls.query.filter(cls.code==code).filter(cls.semester==semester).filter(cls.session==session).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

class SectionData(DBBase,CMethods):
    __tablename__='sectiondatas'
    __table_args__= (
        UniqueConstraint('subject_id','sectionno'),
    )

    id = Column(Integer, primary_key=True)
    subject_id=Column(Integer,ForeignKey('subjectdatas.id'))
    sectionno = Column(Integer)
    lecturer=Column(String(200))
    venue=Column(String(200))
    day=Column(String(200))
    time=Column(String(200))

    subject=relationship(SubjectData,backref=backref('sections',cascade="all, delete-orphan"))

    @classmethod
    def get_section_data(cls,code,session,semester,section):
        subject=SubjectData.get_subject_data(code,session,semester)
        if(subject==None):
            return None
        try:
            return cls.query.filter(cls.subject==subject).filter(cls.sectionno==section).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None


class Theme(DBBase,CMethods):
    __tablename__='themes'

    name=Column(String(250),primary_key=True)
    submitter=Column(String(250))
    email=Column(String(250))
    data=Column(Text)
    counter=Column(Integer)
    rendered=Column(Text)

    def simple_to_hash(self):
      return { "name":self.name, "submitter":self.submitter }

    def generate_photo(self):
      with tempfile.NamedTemporaryFile(suffix=".html") as tfile:
        tfile.write(self.rendered.encode('utf8'))
        tfile.flush()
        subprocess.check_output(["webkit2png", os.path.abspath(tfile.name),"--output="+os.path.join(os.path.dirname(__file__), "static/themeimage/%s.png"%(self.name)),"--scale=200","150"])

