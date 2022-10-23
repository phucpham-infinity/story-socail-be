import * as axios from "axios";

export const useAxios = (url: string) => {
  const get: () => Promise<[any, Error | null]> = async () => {
    try {
      //@ts-ignore
      const res = await axios.get(url);
      return [res.data, null];
    } catch (error: any) {
      return [null, error];
    }
  };

  return { get };
};
