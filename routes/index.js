'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const moment = require('moment-timezone');
const { Sequelize } = require('../models/sequelize-loader');
const Op = Sequelize.Op;

/* GET home page. */
router.get('/', (req, res, next) => {
  // const title = '予定調整くん';
  // let searchResult;
  // if (req.user) {
  //   Schedule.findAll({
  //     where: {
  //       createdBy: req.user.id
  //     },
  //     include:[{  // 内部結合
  //       model: Candidate,
  //       attributes: ['candidateName']
  //     }],
  //     order: [['updatedAt', 'DESC']]
  //   }).then((schedules) => {
  //     schedules.forEach((schedule) => {
  //       // 候補日時作成
  //       let candidateNames = "";
  //       schedule.candidates.forEach((c) => {
  //         candidateNames = candidateNames + c.candidateName + ', '  
  //       });
  //       schedule.candidateNames = candidateNames;
  //       // schedule.formattedUpdatedAt = moment(schedule.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
  //     });
  //     res.render('index', {
  //       title: title,
  //       user: req.user,
  //       schedules: schedules,
  //       searchResult: searchResult
  //     });
  //   });
  // } else {
  //   res.render('index', { title: title, user: req.user });
  // }
  createIndexPage(req, res, []);
});

router.post('/search', (req, res, next) => {
  const scheduleQuery = "%" + req.body.scheduleQuery + "%";
  const candidateQuery = "%" + req.body.candidateQuery + "%";

  Schedule.findAll({
    include:[{  // 内部結合
      model: Candidate,
      // attributes: ['candidateName'],
      where: {
        candidateName: {
          [Op.like]: candidateQuery
        },
      }
    }],
    where: {
      scheduleName: {
        [Op.like]: scheduleQuery
      },
      createdBy: req.user.id
    },
    attributes: ['scheduleId'],
    order: [['updatedAt', 'DESC']]
  }).then((searchedSchedules) => {
    let scheduleIds = [];
    searchedSchedules.forEach((s) => {
      scheduleIds.push(s.scheduleId);
    });
    Schedule.findAll({
      where: {
        scheduleId: {
          [Op.in]: scheduleIds
        }
      },
      include:[{  // 内部結合
        model: Candidate,
        attributes: ['candidateName']
      }],
      attributes: ['scheduleId', 'scheduleName'],
      order: [['updatedAt', 'DESC']]
    }).then((schedules) => {
      schedules.forEach((schedule) => {
        // 候補日時作成
        let candidateNames = "";
        schedule.candidates.forEach((c) => {
          candidateNames = candidateNames + c.candidateName + ', '  
        });
        schedule.candidateNames = candidateNames;
      });
      let searchResult = schedules;
    
      createIndexPage(req, res, searchResult);
    });
  });
});

function createIndexPage(req, res, searchResult) {
  const title = '予定調整くん';
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
        searchResults: searchResult
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
}


module.exports = router;
