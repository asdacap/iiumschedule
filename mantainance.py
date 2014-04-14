#! /usr/bin/python
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
