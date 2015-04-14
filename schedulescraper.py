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
from bs4 import BeautifulSoup
import sys
import urllib2
import urllib
import logging
import gc
from datetime import datetime
from urlparse import urlparse,parse_qsl

import staticsettings
SOURCE_URL=staticsettings.SCRAPER_SOURCE_URL

'''
A compatibility function. Works the samme way as previous one,
but use fetch_schedule_data_callback internally, then rebuild the
result dictionary
'''
def fetch_schedule_data(session):

    result={}

    def callback(sem,stype,kuly,rowdata):
        if(sem not in result):
            result[sem]={}
        if(stype not in result[sem]):
            result[sem][stype]={}
        if(kuly not in result[sem][stype]):
            result[sem][stype][kuly]={}
        if(rowdata['code'] not in result[sem][stype][kuly]):
            result[sem][stype][kuly][rowdata['code']]={
                'title':rowdata['title'],
                'credit':rowdata['credit'],
                'sections':{}
            }

        result[sem][stype][kuly][rowdata['code']]['sections'][rowdata['section']]={
            'lecturer':rowdata['lecturer'],
            'schedules':rowdata['schedules']
        }

    metas=fetch_schedule_data_callback(session,callback)
    metas['results']=result
    return metas

'''
Instead of giving everything in one return, this thing will
call the callback for every row and will then return the metas.
'''
def fetch_schedule_data_callback(session,callback):

    logging.info('Requesting main form for session '+session+'...')
    startat=datetime.now()
    htdata=urllib2.urlopen(SOURCE_URL)

    soup=BeautifulSoup(htdata)

    #options got from main form selects
    kulys=[(str(x['value']),str(x.string)) for x in soup.find(attrs={'name':'kuly'})('option')]
    sems=( ( '1' , '1' ),( '2' , '2' ),( '3' , '3' ) )
    ctypes=[(str(x['value']),str(x.string)) for x in soup.find(attrs={'name':'ctype'})('option')]

    soup.decompose()
    soup=None

    #also known as default params
    extraparams={
        'action':'view',
        'ses':session
    }

    #so that same url wont be fetched twice
    fetched=[]

    #tested=False

    #a queue that is used to not use recursion and improve memory usage
    fetchqueue=[]

    #A function that scan table html
    def scan_it(kulys,sems,ctypes,view=50,):
        param=extraparams.copy()

        param['kuly']=kulys[0]
        param['sem']=sems[0]
        param['ctype']=ctypes[0]
        param['view']=view

        theurl=SOURCE_URL+'?'+urllib.urlencode(param)
        if(theurl in fetched):
            return

        logging.info('Requesting '+theurl)

        #helps with debugging
        #global scheduletable

        ''' used in debugging
        global tested
        if(tested):
            return
        tested=True
        '''

        try:
            request=urllib2.urlopen(theurl)
            scheduletable=BeautifulSoup(request.read())
            request.close()
            fetched.append(theurl)
        except urllib2.URLError,e:
            logging.info("Error fetching. Trying again")
            fetchqueue.append((kulys,sems,ctypes,view),)
            return


        if(len(scheduletable.find_all('table'))==1):
            logging.info('Error, got back main form')
            return

        trs=scheduletable.find_all('table')[1].find_all('tr',recursive=False)[2:-1]
        logging.info("Got "+str(len(trs))+" records")

        for row in trs:
            tds=row.find_all('td')

            rowdata={
                'code':tds[0].string,
                'section':tds[1].string,
                'title':tds[2].string,
                'credit':tds[3].string,
                'lecturer':tds[8].string,
                'schedules': []
            }

            scheduletrs=tds[4].find_all('tr')
            for tr in scheduletrs:
                tdss = tr.find_all('td')
                rowdata['schedules'].append({
                    'day': tdss[0].string,
                    'time': tdss[1].string,
                    'venue': tdss[2].string,
                    'lecturer': tdss[3].string
                })

            callback(sems[0],ctypes[0],kulys[0],rowdata)

        links=[str(x['href']) for x in scheduletable.find_all('table')[1].td.find_all('a')]
        trs=None
        tds=None
        scheduletable.decompose()
        scheduletable=None
        gc.collect()

        for link in links:
            newparam=dict(parse_qsl(urlparse(link).query))
            fetchqueue.append((kulys,sems,ctypes,newparam['view']),)

    #iterate over everything and start scraping
    for kul in kulys:
        for sem in sems:
            for ctype in ctypes:
                fetchqueue.append((kul,sem,ctype),)


    #start executing queue
    while(len(fetchqueue)>=1):
        cur=fetchqueue.pop()
        scan_it(*cur)

    resultarr={'metas':{
        'kulys':kulys,
        'sems':sems,
        'ctypes':ctypes
        }}

    endat=datetime.now()
    duration=endat-startat
    logging.info('Done. Duration '+str(duration))
    return resultarr

def sample_callback(sem,stype,kuly,rowdata):
    pass

if __name__ == '__main__':
    import sys
    import logging.config

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
                }
            },
            'root':{
                'level':'INFO',
                'handlers':['console']
            }
        })

    if(len(sys.argv) != 3):
        print("Invalid arguments %")
        print("Usage : schedulescraper.py [session] [outputfile]")
    else:
        session=sys.argv[1]
        outputfile=sys.argv[2]
        result=fetch_schedule_data(session)

        with open(outputfile,'w') as dumpit:
            import json
            dumpit.write(json.dumps(result,indent=2))

        print('done')
