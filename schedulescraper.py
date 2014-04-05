#!/usr/bin/python

from bs4 import BeautifulSoup
import sys
import urllib2
import urllib
import logging
from datetime import datetime
from urlparse import urlparse,parse_qsl

SOURCE_URL='http://itdportal.iium.edu.my/student/schedule1.php'

def fetch_schedule_data(session):

    logging.info('Requesting main form for session '+session+'...')
    startat=datetime.now()
    htdata=urllib2.urlopen(SOURCE_URL)

    soup=BeautifulSoup(htdata)

    #options got from main form selects
    kulys=[[x['value'],x.string] for x in soup.find(attrs={'name':'kuly'})('option')]
    sems=[[x['value'],x.string] for x in soup.find(attrs={'name':'sem'})('option')]
    ctypes=[[x['value'],x.string] for x in soup.find(attrs={'name':'ctype'})('option')]


    #this is where data will be kept
    results={}

    #initializing the structure
    #would be in  [sems][ug/pg][kuliyyah][code].section[section]
    #[semd][ug/pg][kuliyyah][code].title is the title of code
    for sem in sems:
        results[sem[0]]={}
        for ctype in ctypes:
            results[sem[0]][ctype[0]]={}
            for kul in kulys:
                results[sem[0]][ctype[0]][kul[0]]={}


    #also known as default params
    extraparams={
        'action':'view',
        'ses':session
    }

    #so that same url wont be fetched twice
    fetched=[]

    #tested=False

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
        global scheduletable

        ''' used in debugging
        global tested
        if(tested):
            return
        tested=True
        '''

        try:
            scheduletable=BeautifulSoup(urllib2.urlopen(theurl))
            fetched.append(theurl)
        except urllib2.URLError,e:
            logging.info("Error fetching. Trying again")
            scan_it(kulys,sems,ctypes,view)
            return


        if(len(scheduletable.find_all('table'))==1):
            logging.info('Error, got back main form')
            return

        trs=scheduletable.find_all('table')[1].find_all('tr',recursive=False)[2:-1]

        for row in trs:
            tds=row.find_all('td')
            rowdata={
                'code':tds[0].string,
                'section':tds[1].string,
                'title':tds[2].string,
                'credit':tds[3].string,
                'day':tds[5].string,
                'time':tds[6].string,
                'venue':tds[7].string,
                'lecturer':tds[8].string,
            }

            aresult={
                'day':rowdata['day'],
                'time':rowdata['time'],
                'venue':rowdata['venue'],
                'lecturer':rowdata['lecturer'],
            }

            if(rowdata['code'] not in results[sems[0]][ctypes[0]][kulys[0]]):
                results[sems[0]][ctypes[0]][kulys[0]][rowdata['code']]={
                    'title':rowdata['title'],
                    'credit':rowdata['credit'],
                    'sections':{}
                }

            results[sems[0]][ctypes[0]][kulys[0]][rowdata['code']]['sections'][rowdata['section']]=aresult

        links=[x['href'] for x in scheduletable.find_all('table')[1].td.find_all('a')]
        for link in links:
            newparam=dict(parse_qsl(urlparse(link).query))
            scan_it(kulys,sems,ctypes,newparam['view'])

    #iterate over everything and start scraping
    for kul in kulys:
        for sem in sems:
            for ctype in ctypes:
                scan_it(kul,sem,ctype)

    resultarr={'metas':{
        'kulys':kulys,
        'sems':sems,
        'ctypes':ctypes
        },'results':results}

    endat=datetime.now()
    duration=endat-startat
    logging.info('Done. Duration '+str(duration))

    return resultarr
