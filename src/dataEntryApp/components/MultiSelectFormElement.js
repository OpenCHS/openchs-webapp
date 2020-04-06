import { includes, map, isNil } from "lodash";
import React from "react";
import { CodedConceptFormElement } from "./CodedConceptFormElement";
import { MultipleCodedValues } from "avni-models";

export default ({ formElement: fe, value, update, obsHolder }) => {
  const getSelectedAnswer = (concept, nullReplacement) => {
    const observation = obsHolder.findObservation(concept);
    return isNil(observation) ? nullReplacement : observation.getValueWrapper();
  };
  const valueWrapper = getSelectedAnswer(fe.concept, new MultipleCodedValues());
  const [validationErrMessage, setValidationErrMessage] = React.useState("");

  const setValidationResultToError = validationResult => {
    setValidationErrMessage(validationResult.messageKey);
  };

  return (
    <CodedConceptFormElement
      isChecked={answer => {
        const answerAlreadyPresent = valueWrapper.isAnswerAlreadyPresent(answer.uuid);
        console.log(
          `MultiSelectFormElement: ${answer.name} ${answer.uuid} ${answerAlreadyPresent}`
        );
        return answerAlreadyPresent;
      }}
      onChange={answer => {
        update(answer.uuid);
        setValidationResultToError(fe.validate(answer));
      }}
      errorMsg={validationErrMessage}
      mandatory={fe.mandatory}
    >
      {fe}
    </CodedConceptFormElement>
  );
};
