
export async function sleep(delay = 1000) {
  return await new Promise(resolve => setTimeout(resolve, delay));
}
