import fetch from "node-fetch";
import { ApiError } from "../error";
import Reddit from "../reddit";

const graphqlUrl = "https://gql.reddit.com";

interface GraphQLError {
  message: string;
  locations: { line: number; column: number }[];
  path: string[];
}

interface GraphQLResponse<T> {
  errors?: GraphQLError[];
  data: T;
}

export class ApiClient {
  r: Reddit;

  constructor(r: Reddit) {
    this.r = r;
  }

  async gql<T>(id: string, data?: object): Promise<T> {
    const res = await fetch(graphqlUrl, {
      method: "post",
      headers: {
        Authorization: `Bearer ${this.r.auth?.session?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, variables: data }),
    });

    const body: GraphQLResponse<T> = await res.json();

    if (body.errors) {
      const err = body.errors[0];
      const [code, msg] = err.message.split(":");

      throw new ApiError(code.trimRight(), msg.trimLeft());
    }

    return body.data;
  }
}
