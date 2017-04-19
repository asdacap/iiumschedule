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
from flask import Flask, render_template, request, g, jsonify
from bootstrap import app,db
from models import SubjectData,SectionData
import json
import staticsettings
@app.route('/schedulemaker/fetch_subject/')
def fetchsubject():
	if(set(['session','semester','coursetype']).issubset(request.args.keys()) and [x for x in ['session','semester','coursetype'] if request.args.get(x)!='' ]):
		sdlist=db.session\
			.query(SubjectData.kuliyyah,SubjectData.code,SubjectData.title,SubjectData.id,SubjectData.credit)\
			.filter(SubjectData.session==request.args.get('session'))\
			.filter(SubjectData.semester==request.args.get('semester'))\
			.filter(SubjectData.coursetype==request.args.get('coursetype').upper())\
			.all()

		finalres={}
		for r in sdlist:
			if(r[0] not in finalres):
				finalres[r[0]]=[]
			finalres[r[0]].append({
				'id':r[3],
				'code':r[1],
        'ch':r[4],
				'title':r[2],
			});
		return json.dumps(finalres)
	return 'Arguments not filled',400

from sqlalchemy.ext.declarative import DeclarativeMeta
class AlchemyEncoder(json.JSONEncoder):
	def default(self, obj):
	    if isinstance(obj.__class__, DeclarativeMeta):
	        # an SQLAlchemy class
	        fields = {}
	        for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
	            data = obj.__getattribute__(field)
	            try:
	                json.dumps(data) # this will fail on non-encodable values, like other classes
	                fields[field] = data
	            except TypeError:
	                fields[field] = None
	        # a json-encodable dict
	        return fields

	    return json.JSONEncoder.default(self, obj)


@app.route('/schedulemaker/fetch_section/')
def fetchsection():
	if('id' not in request.args.keys()):
		return 'Arguments not filled',400
	finalres=SectionData.query.filter(SectionData.subject_id==request.args.get('id')).all()
	finalres=[{
        'id':x.id,
		'subject_id':x.subject_id,
		'sectionno':x.sectionno,
		'lecturer':x.lecturer,
    'schedule':[{
        'venue':y.venue,
        'day':y.day,
        'time':y.time,
        'lecturer':y.lecturer,
      } for y in x.schedules]
	} for x in finalres]
	return json.dumps(finalres,cls=AlchemyEncoder)

@app.route('/schedulemaker/')
def schedulemaker():
        query=False
	available_sessions = staticsettings.SESSIONS_STILL_UPDATE
	if(set(['ses','sem','st','code','section']).issubset(request.args.keys()) and [x for x in ['ses','sem','st','code','section'] if request.args.get(x)!='' ]):
            query={}
            for x in ['ses','sem','st','code','section']:
                query[x]=request.args.get(x)
        return render_template('schedulemaker.html',
			query = json.dumps(query),
			available_sessions = json.dumps(available_sessions))

@app.route('/maker/')
def schedulemaker_manual():
    return render_template('makermainpage.html')
