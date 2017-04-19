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
import os
import sys

# required to load libraries under server/lib that Flask depends on
app_root_dir = os.path.dirname(__file__)
server_lib_dir = os.path.join(app_root_dir, 'server/lib')

if server_lib_dir not in sys.path:
  sys.path.insert(0, server_lib_dir)

from flask import Flask, render_template, request, g
from flask_sqlalchemy import SQLAlchemy
from staticsettings import DB_CONN, SESSION_SECRET
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']=DB_CONN
app.config['SECRET_KEY']=SESSION_SECRET

db = SQLAlchemy(app)
import models
db.create_all()

import logging
hdlr = logging.FileHandler(os.path.dirname(os.path.realpath(__file__))+'/log/iiumschedule.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
app.logger.addHandler(hdlr)

