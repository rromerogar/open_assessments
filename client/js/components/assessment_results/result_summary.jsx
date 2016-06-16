"use strict";

import React                 from "react";
import { connect }           from "react-redux";
import _                     from "lodash";

import AssessmentStore       from "../../stores/assessment";
import ReviewAssessmentStore from "../../stores/review_assessment";
import ItemResult            from "./item_result";

// import { outcomes }          from "../../selectors/assessment";

// const select = (state, props) => {
//   return {
//     assessmentResult : AssessmentStore.assessmentResult(), // TODO this won't work. have to figure out where to get assessmentResult from
//     outcomes         : outcomes(),
//     settings         : state.settings,
//     assessment       : state.assessment
//   };
// };

// @connect(select, {}, null, { withRefs: true })
export default class ResultSummary extends React.Component{

  getOutcomeLists(){
    var lists = {
      positiveList: [],
      negativeList: []
    };
    var sectionIndex = 0;
    var perSecCount = 0;
    var correctCount = 0;
    var correctList = this.state.assessmentResult.correct_list;
    for(var i = 0; i < correctList.length; i++){
      //make sure to check to see if the amount of questions per section is less the ammount chosen per section
      var correct = correctList[i];
      perSecCount++;

      if(!correct || correct == "partial"){
        lists.negativeList.push(this.state.outcomes[sectionIndex]);
        i += (this.state.settings.perSec - perSecCount);
        sectionIndex++;
        perSecCount = 0;
        continue;
      } else {
        correctCount++;
        if(correctCount == this.state.settings.perSec || correctCount == this.state.assessment.sections[sectionIndex].items.length){
          lists.positiveList.push(this.state.outcomes[sectionIndex]);
          correctCount = 0;
        }
      }

      if(perSecCount == this.state.settings.perSec || perSecCount == this.state.assessment.sections[sectionIndex].items.length){
        sectionIndex++;
        correctCount = 0;
        perSecCount = 0;
      }
    }

    return lists;
  }

  getReviewOutcomeList() {
    var positiveList = _.clone(this.state.outcomes);
    var negativeList = [];

    this.props.questionResponses.map((qr, index)=> {
      let question = ReviewAssessmentStore.itemByIdent(qr.ident);
      if (question !== undefined) {
        if (qr.correct !== true) {
          negativeList = negativeList.concat(_.filter(positiveList, 'outcomeGuid', question.outcome_guid));
          positiveList = _.reject(positiveList, 'outcomeGuid', question.outcome_guid);
        }
      }
    });

    return {
      positiveList: positiveList,
      negativeList: negativeList
    };
  }

  generateOutcomeLists(){
    var lists;
    if(this.props.questionResponses){
      lists = this.getReviewOutcomeList();
    } else {
      lists = this.getOutcomeLists();
    }

    lists.positiveList = lists.positiveList.map((item, index)=>{
      return <div key={"positive " + index} title={item.longOutcome}><p><i className="glyphicon glyphicon-ok"></i>{" " + item.shortOutcome + " "}<i className="glyphicon glyphicon-info-sign"></i></p></div>;
    });

    lists.negativeList = lists.negativeList.map((item, index)=>{
      return <div key={"negative " + index} title={item.longOutcome}><p>{item.shortOutcome}</p></div>;
    });

    return lists;
  }

  render() {
    var outcomeLists = this.generateOutcomeLists();
    var name = "Your Score";
    if( this.props.user && this.props.user.name ){
      name = "Score for " + this.props.user.name;
    }
    var timeSpent = null;
    if( this.props.timeSpent ){
      timeSpent= "Time Spent: " + this.props.timeSpent.minutes + " mins " + this.props.timeSpent.seconds + " secs"
    }
    var contentData = {
          goodWork:"Good Work on These Concepts",
          moreToLearn:"There is Still More to Learn",
          focusStudy:"Review these concepts before your last quiz attempt or to prepare for your next performance assessment."
        };

    if(this.state.settings.assessmentKind.toUpperCase() == "SHOW_WHAT_YOU_KNOW"){
      contentData = {
        goodWork: "What You Already Know",
        moreToLearn: "What You Need to Learn",
        focusStudy: "Focus enough study time on these concepts to learn them well."
      };
    }

    return (<div className="row" tabIndex="0">

          <div className="col-md-4 col-sm-4 col-xs-4" >
            <h3><strong>{name}</strong></h3>
            <div>
              <h1>{Math.floor(this.state.assessmentResult.score)}%</h1>
            </div>
            {timeSpent}
            <br />
          </div>

          <div className="col-md-4 col-sm-4 col-xs-4" >
            <h3><strong>{contentData.goodWork}</strong></h3>
            <p>You answered questions that covered these concepts correctly.</p>
            {outcomeLists.positiveList}
            <div></div>
          </div>

          <div className="col-md-4 col-sm-4 col-xs-4" >
            <h3><strong>{contentData.moreToLearn}<i styleclassName="glyphicon glyphicon-warning-sign" ></i></strong></h3>
            <p>{contentData.focusStudy}</p>
            {outcomeLists.negativeList}
          </div>

        </div>)
  }

}
