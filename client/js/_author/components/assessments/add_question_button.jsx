import React    from 'react';

export default function addQuestionButton(props) {
  return (
    <div className="author--c-question-add">
      <button
        onClick={props.newItem}
        className="author--c-question-add__button"
      >
        Add Question
      </button>
    </div>
  );
}

addQuestionButton.propTypes = {
  newItem: React.PropTypes.func.isRequired,
};
