#!/usr/bin/python
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

import bootstrap
import schedulescraper
import logging
import logging.config
import admincontroller
import staticsettings
import sqlalchemy.orm.exc
from flask import g
from models import SubjectData,SectionData

logging.config.dictConfig({
    'version':1,
        'formatters':{
            'simple':{
                'format':'%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            }
        },
        'handlers':{
            'console':{
                'class':'logging.StreamHandler',
                'level':'INFO',
                'formatter':'simple',
                'stream': 'ext://sys.stdout'
            },
            'file':{
                'class':'logging.handlers.RotatingFileHandler',
                'filename': 'course_data_updater.log',
                'level':'INFO',
                'formatter':'simple',
            }
        },
        'root':{
            'level':'INFO',
            'handlers':['console','file']
        }
    })

sessions=staticsettings.SESSIONS_STILL_UPDATE

with bootstrap.app.app_context():
    for session in sessions:

        logging.info("=== STARTING UPDATE ===")

        def callback(sem,stype,kuly,data):
            if(stype=='<'):
                stype='UG'
            else:
                stype='PG'
            code=data['code']

            obj=SubjectData.get_subject_data(code,session,sem)
            if(obj!=None):
                if(obj.coursetype==stype and
                    obj.title==data['title'] and
                    obj.credit==float(data['credit']) and
                    obj.kuliyyah==kuly and
                    obj.session==session and
                    obj.semester==int(sem)):
                    pass
                else:
                    obj.coursetype=stype
                    obj.title=data['title']
                    obj.credit=float(data['credit'])
                    obj.kuliyyah=kuly
                    obj.session=session
                    obj.semester=sem
                    obj.put()
                    logging.info("Update subject %s"%obj.code)
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
                logging.info("Insert subject %s"%obj.code)

            section=data['section']
            try:
                sdata=SectionData.query.filter(SectionData.subject==obj).filter(SectionData.sectionno==section).one()
                if(sdata.lecturer==data['lecturer'] and
                    sdata.venue==data['venue'] and
                    sdata.day==data['day'] and
                    sdata.time==data['time']):
                    pass
                else:
                    sdata.lecturer=data['lecturer']
                    sdata.venue=data['venue']
                    sdata.day=data['day']
                    sdata.time=data['time']
                    sdata.put()
                    logging.info("Update subject %s section %s"%(data['code'],data['section']))
            except sqlalchemy.orm.exc.NoResultFound, e:
                sdata=SectionData()
                sdata.subject=obj
                sdata.sectionno=section
                sdata.lecturer=data['lecturer']
                sdata.venue=data['venue']
                sdata.day=data['day']
                sdata.time=data['time']
                sdata.put()
                logging.info("Add subject %s section %s"%(data['code'],data['section']))

        obj=schedulescraper.fetch_schedule_data_callback(session,callback)

        logging.info("Done update")

