import ky, { HTTPError } from 'ky';
import { APIError } from './error';
import { APIParams } from './types';

const instance = ky.create({
  prefixUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`,
});

/**
 * Makes an HTTP request to the specified API endpoint.
 *
 * @template T The expected response type.
 * @returns The response data in the specified type `T`.
 * @throws An `APIError` if the request encounters an HTTP error or an unknown error.
 */
export const api = async <T>({
  method = 'get',
  url,
  options,
  body = 'json',
}: APIParams): Promise<T> => {
  const joinedUrl = typeof url === 'string' ? url : url.join('/');

  try {
    const response = instance<T>(joinedUrl, {
      method,
      ...options,
    });
    const data = await (response[body] as () => Promise<T>)();
    return data;
  } catch (err) {
    if (err instanceof HTTPError) {
      throw new APIError(
        'HTTP Error occurred.',
        err.response.status,
        err.response
      );
    }
    console.log(JSON.stringify(err));
    throw new APIError();
  }
};
