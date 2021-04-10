import { AxiosResponse } from "axios";

export default function debugInterceptor(res: AxiosResponse) {
  console.log(res.request);
  return res;
}
