#!/usr/bin/python

import bootstrap
import schedulescraper
import logging
import logging.config
import admincontroller
import staticsettings
from flask import g

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
    g.counter=0
    for session in sessions:
        obj=schedulescraper.fetch_schedule_data(session)
        admincontroller.update_subject_data_bulk(obj,session)
        logging.info("%s session data added/updated."%g.counter)
