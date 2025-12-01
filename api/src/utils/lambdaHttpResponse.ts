
export function lambdaHttpResponse(statusCode: number, body?: Record<string, unknown>) {

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
