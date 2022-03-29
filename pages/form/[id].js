import {
  Header,
  HeaderName,
  TextInput,
  RadioButtonGroup,
  RadioButton,
  NumberInput,
  Tile,
  Select,
  SelectItem,
  Button,
  Form,
} from "carbon-components-react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export default function Home({ data, token }) {
  if (!data) {
    return (
      <Tile>
        <h1>Form Not Found</h1>
        <p>
          The form id you have eneterd is incorrect please check the URL again.
        </p>
      </Tile>
    );
  }
  const client = new ApolloClient({
    uri: "https://hrbt-portal.hasura.app/v1/graphql/",
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const answer_mutation = gql`
    mutation AnswerForm(
      $data: json!
      $filled_by: String!
      $form: Int!
      $form_creator: String!
    ) {
      insert_answers_one(
        object: {
          filled_by: $filled_by
          data: $data
          form: $form
          form_creator: $form_creator
        }
      ) {
        filled_by
        form
        form_creator
        id
      }
    }
  `;
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formDataJson = {};
    for (let entry of formData.entries()) {
      formDataJson[entry[0]] = entry[1];
    }
    const res = await client.mutate({
      mutation: answer_mutation,
      variables: {
        data: formDataJson,
        filled_by: "Anonymous-Web",
        form: data.id,
        form_creator: data.User.username,
      },
    });
    return (
      <>
        <Header aria-label="Formee" style={{ position: "relative" }}>
          <HeaderName href="/" prefix="Formee | ">
            {data.title}
          </HeaderName>
        </Header>
        <Tile>
          <h2>{data.title}</h2>
          {data.description}
        </Tile>
        <Tile>
          <h3>Thank you for submitting the form</h3>
        </Tile>
      </>
    );
  }
  return (
    <>
      <Header aria-label="Formee" style={{ position: "relative" }}>
        <HeaderName href="/" prefix="Formee | ">
          {data.title}
        </HeaderName>
      </Header>
      <Tile>
        <h2>{data.title}</h2>
        {data.description}
      </Tile>
      <div style={{ position: "relative", margin: "2rem" }}>
        <Form onSubmit={handleSubmit} id="form">
          {data.ques_texts.map((field, index) => {
            return (
              <div style={{ marginBottom: "2rem" }} key={index}>
                <TextInput
                  id={field.title}
                  invalidText="Invalid text"
                  labelText={field.title}
                  placeholder="Some text"
                  name={field.title}
                />
              </div>
            );
          })}
          {data.ques_numbers.map((field, index) => {
            return (
              <div style={{ marginBottom: "2rem" }} key={index}>
                <NumberInput
                  id={field.title}
                  invalidText="Invalid number"
                  label={field.title}
                  name={field.title}
                />
              </div>
            );
          })}

          {data.ques_options.map((field, index) => {
            return (
              <div style={{ marginBottom: "2rem" }} key={index}>
                <Select
                  name={field.title}
                  id={field.title}
                  labelText={field.title}
                >
                  {field.options.map((option, index) => {
                    return (
                      <SelectItem
                        key={index}
                        text={option.title}
                        value={option.title}
                      />
                    );
                  })}
                </Select>
              </div>
            );
          })}
          {data.ques_confirms.map((field, index) => {
            return (
              <div style={{ marginBottom: "2rem" }} key={index}>
                <RadioButtonGroup
                  id={field.title}
                  legendText={field.title}
                  name={field.title}
                >
                  <RadioButton id="yes" labelText="Yes" value={field.title} />
                </RadioButtonGroup>
              </div>
            );
          })}
          <Button kind="primary" tabIndex={0} type="submit">
            Submit
          </Button>
        </Form>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  const token = process.env.VISITOR_JWT
  const client = new ApolloClient({
    uri: "https://hrbt-portal.hasura.app/v1/graphql/",
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await client.query({
    query: gql`
      query GetForm($id: Int!) {
        Form_by_pk(id: $id) {
          User {
            username
          }
          id
          description
          title
          ques_confirms {
            title
          }
          ques_numbers {
            title
          }
          ques_options {
            title
            options {
              title
            }
          }
          ques_texts {
            title
          }
        }
      }
    `,
    variables: {
      id: id,
    },
  });
  return {
    props: {
      data: data.Form_by_pk,
      token: token,
    },
  };
}
