'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = '予定調整くん';
  let searchResult;
  if (req.user) {
    Schedule.findAll({
      where: {
        createdBy: req.user.id
      },
      include:[{  // 内部結合
        model: Candidate,
        attributes: ['candidateName']
      }],
      order: [['updatedAt', 'DESC']]
    }).then((schedules) => {
      schedules.forEach((schedule) => {
        // 候補日時作成
        let candidateNames = "";
        schedule.candidates.forEach((c) => {
          candidateNames = candidateNames + c.candidateName + ', '  
        });
        schedule.candidateNames = candidateNames;
        // schedule.formattedUpdatedAt = moment(schedule.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      res.render('index', {
        title: title,
        user: req.user,
        schedules: schedules,
        searchResult: searchResult
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
