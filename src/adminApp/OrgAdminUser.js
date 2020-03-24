import { isEmpty } from "lodash";
import React, { Fragment, useState } from "react";
import {
  Create,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  FormDataConsumer,
  FunctionField,
  List,
  REDUX_FORM_NAME,
  ReferenceField,
  ReferenceInput,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput
} from "react-admin";
import CardActions from "@material-ui/core/CardActions";
import { change } from "redux-form";
import EnableDisableButton from "./components/EnableDisableButton";
import { OrganisationSelectInput } from "./components/OrganisationSelectInput";
import {
  CustomToolbar,
  formatRoles,
  isRequired,
  mobileNumberFormatter,
  mobileNumberParser,
  PasswordTextField,
  UserFilter,
  UserTitle,
  validateEmail,
  validatePhone
} from "./UserHelper";
import http from "common/utils/httpClient";

export const OrgAdminUserCreate = ({ user, ...props }) => (
  <Create {...props}>
    <UserForm user={user} />
  </Create>
);

export const OrgAdminUserEdit = ({ user, ...props }) => (
  <Edit
    {...props}
    title={<UserTitle titlePrefix="Edit" />}
    undoable={false}
    filter={{ searchURI: "orgAdmin" }}
  >
    <UserForm edit user={user} />
  </Edit>
);

export const OrgAdminUserList = ({ ...props }) => (
  <List
    {...props}
    bulkActions={false}
    filter={{ searchURI: "find" }}
    filters={<UserFilter />}
    title={`Organisation Admin Users`}
  >
    <Datagrid rowClick="show">
      <TextField label="Login ID" source="username" />
      <TextField source="name" label="Name of the Person" />
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
      <ReferenceField
        label="Organisation"
        source="organisationId"
        reference="organisation"
        linkType="show"
        allowEmpty
      >
        <TextField source="name" />
      </ReferenceField>
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <FunctionField
        label="Status"
        render={user =>
          user.voided === true ? "Deleted" : user.disabledInCognito === true ? "Disabled" : "Active"
        }
      />
    </Datagrid>
  </List>
);

const CustomShowActions = ({ basePath, data, resource }) => {
  return (
    (data && (
      <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
        <EditButton label="Edit User" basePath={basePath} record={data} />
        <EnableDisableButton
          disabled={data.disabledInCognito}
          basePath={basePath}
          record={data}
          resource={resource}
        />
      </CardActions>
    )) ||
    null
  );
};

export const OrgAdminUserDetail = ({ user, ...props }) => (
  <Show title={<UserTitle />} actions={<CustomShowActions user={user} />} {...props}>
    <SimpleShowLayout>
      <TextField source="username" label="Login ID (username)" />
      <TextField source="name" label="Name of the Person" />
      <TextField source="email" label="Email Address" />
      <TextField source="phoneNumber" label="Phone Number" />
      <ReferenceField
        label="Organisation"
        source="organisationId"
        reference="organisation"
        linkType="show"
        allowEmpty
      >
        <TextField source="name" />
      </ReferenceField>
      <FunctionField label="Role" render={user => formatRoles(user.roles)} />
    </SimpleShowLayout>
  </Show>
);

const UserForm = ({ edit, user, ...props }) => {
  const [nameSuffix, setNameSuffix] = useState("");
  const getOrgData = id =>
    id &&
    http.get(`/organisation/${id}`).then(res => {
      res && setNameSuffix(res.data.usernameSuffix);
    });

  const sanitizeProps = ({ record, resource, save }) => ({
    record,
    resource,
    save
  });
  return (
    <SimpleForm toolbar={<CustomToolbar />} {...sanitizeProps(props)} redirect="show">
      <ReferenceInput
        resource="organisation"
        source="organisationId"
        reference="organisation"
        label="Organisation Name"
        validate={required("Please select a organisation")}
      >
        <OrganisationSelectInput source="name" resettable disabled={edit} />
      </ReferenceInput>
      {edit ? (
        <DisabledInput source="username" label="Login ID (admin username)" />
      ) : (
        <Fragment>
          <FormDataConsumer>
            {({ formData, dispatch, ...rest }) => {
              formData && getOrgData(formData.organisationId);
              return (
                <Fragment>
                  <TextInput
                    source="ignored"
                    validate={isRequired}
                    label={"Login ID (username)"}
                    onChange={(e, newVal) =>
                      !isEmpty(newVal) &&
                      dispatch(change(REDUX_FORM_NAME, "username", newVal + "@" + nameSuffix))
                    }
                    {...rest}
                  />
                  <span>@{nameSuffix}</span>
                </Fragment>
              );
            }}
          </FormDataConsumer>
        </Fragment>
      )}
      {!edit && <PasswordTextField />}
      <TextInput source="name" label="Name of the Person" validate={isRequired} />
      <TextInput source="email" label="Email Address" validate={validateEmail} />
      <TextInput
        source="phoneNumber"
        label="10 digit mobile number"
        validate={validatePhone}
        format={mobileNumberFormatter}
        parse={mobileNumberParser}
      />
      <DisabledInput source="orgAdmin" defaultValue={true} hidden={true} />
    </SimpleForm>
  );
};