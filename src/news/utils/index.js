import { find, isEmpty } from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import React from "react";

export const dispatchActionAndClearError = (type, payload, errorKey, dispatch, error, setError) => {
  setError(error.filter(({ key }) => key !== errorKey));
  dispatch({ type, payload });
};

export const displayErrorForKey = (errors, errorKey) => {
  const errorByKey = find(errors, ({ key }) => key === errorKey);
  return isEmpty(errorByKey) ? null : (
    <FormLabel error style={{ fontSize: "12px" }}>
      {errorByKey.message}
    </FormLabel>
  );
};
