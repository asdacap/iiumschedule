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
