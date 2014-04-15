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
DB_CONN='postgresql://iiumschedule:iiumschedule@localhost/iiumschedule'
RECAPTCHA_PUBLIC_KEY="6LcfOu0SAAAAAKeyYcuC36_U3yEd_TBK8rlmpCIg"
RECAPTCHA_KEY="6LcfOu0SAAAAABQw2aAP0FePvDrA6X9JN8bG2hMB"
DEBUG=False
LOGIN_USERNAME='iiumschedule'
LOGIN_PASSWORD='admin'
SESSION_SECRET=':\x7f\x8f-\xb1\x19\xd2-\x9a\xdb\xe3Pr\x95\xd5\x0c\xd2\xeb\x1e\x93\xa9\x90\xd5B'
SESSIONS_STILL_UPDATE=['2013/2014']

DEFAULTDATA='''{ "coursearray" : [ { "code" : "IFF1454",
        "credithour" : "4",
        "schedule" : [ { "day" : "TUE",
              "end" : 16,
              "start" : 14,
              "venue" : "CS LAB E"
            },
            { "day" : "THUR",
              "end" : 11,
              "start" : 10,
              "venue" : "CS LAB C"
            },
            { "day" : "WED",
              "end" : 13,
              "start" : 11,
              "venue" : "ANNEX BUILDING AX205S"
            }
          ],
        "section" : "435",
        "lecturer" : "Some lecturer",
        "title" : " COMPUTER HARDWARE AND TROUBLESHOOTING"
      },
      { "code" : "IFF1444",
        "credithour" : "4",
        "schedule" : [ { "day" : "TUE",
              "end" : 11,
              "start" : 9,
              "venue" : "LY BUILDING LY024"
            },
            { "day" : "FRI",
              "end" : 12,
              "start" : 10,
              "venue" : "ANNEX LAB COMP L5"
            }
          ],
        "section" : "405",
        "lecturer" : "Some lecturer",
        "title" : "INTRODUCTION TO PROGRAMMING"
      },
      { "code" : "LQM1262",
        "credithour" : "0",
        "schedule" : [ { "day" : "TUE",
              "end" : 13,
              "start" : 11,
              "venue" : "LY 013"
            },
            { "day" : "MON",
              "end" : 16,
              "start" : 14,
              "venue" : "SMWP2 S2135"
            },
            { "day" : "THUR",
              "end" : 18,
              "start" : 16,
              "venue" : "BLOCK E E014"
            }
          ],
        "section" : "401",
        "lecturer" : "Some lecturer",
        "title" : " ELEMENTARY QURANIC LANGUAGE PART 2 (SCIENCES"
      },
      { "code" : "SFF1124",
        "credithour" : "4",
        "schedule" : [ { "day" : "WED",
              "end" : 16.4,
              "start" : 14,
              "venue" : "SMAWP2 S2120"
            },
            { "day" : "MON",
              "end" : 11,
              "start" : 9,
              "venue" : "BLOCK E E122"
            },
            { "day" : "FRI",
              "end" : 10,
              "start" : 9,
              "venue" : "SMAWP2 S2014"
            }
          ],
        "section" : "411",
        "lecturer" : "Some lecturer",
        "title" : "MATHEMATICS II"
      },
      { "code" : "SHE1225",
        "credithour" : "5",
        "schedule" : [ { "day" : "TUE",
              "end" : 18,
              "start" : 16.3,
              "venue" : "ANNEX BUILDING AX206B"
            },
            { "day" : "MON",
              "end" : 13.2,
              "start" : 11,
              "venue" : "SMAWP2 S2011"
            },
            { "day" : "THUR",
              "end" : 10,
              "start" : 8,
              "venue" : "SMAWP2 S3124"
            }
          ],
        "section" : "405",
        "lecturer" : "Some lecturer",
        "title" : "PHYSICS II"
      }
    ],
  "studentname" : "FULANAH BINTI FUULAN",
  "ic" : "930528016935",
  "matricnumber" : "163525",
  "program" : "ICT",
  "semester" : "3",
  "session" : "2011/2012"
}
'''



