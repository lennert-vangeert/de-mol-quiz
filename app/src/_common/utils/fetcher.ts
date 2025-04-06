import axios from "axios";

/**
 * Configuration options for an HTTP request.
 *
 * @property {string} method - The HTTP method to use for the request (e.g., "GET", "POST"). Defaults to "GET" if not provided.
 * @property {Record<string, string>} headers - The headers to include in the request. Defaults to a JSON content type header if not provided.
 * @property {string} url - The URL to which the request is sent.
 * @property {any} data - The body of the request, typically used for POST or PUT requests.
 */
export const fetch = async (
  url: string,
  method?: string,
  headers?: Record<string, string>,
  body?: string
) => {
  const options = {
    method: method ?? "GET",
    headers: headers ?? {
      "Content-Type": "application/json",
    },
    url: url,
    data: body,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
