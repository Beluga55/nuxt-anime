export default async (func) => {
  const app = useNuxtApp();
  const toast = app.$toast;

  try {
    const data = await func();
    return [data, null];
  } catch (error) {
    if (typeof error.response?._data === "string") {
      console.log(error.response._data);
    } else if (!error.response?._data?.errors) {
      console.log(error);
      return Promise.reject(error.response.data);
    } else {
      const errors = error.response._data.errors;
      const errStrArr = errors.map((err) => `"${err?.field}" ${err.message}`);
      errStrArr.forEach((err) => {
        console.log(err);
      });
    }
    return [null, error];
  }
};
