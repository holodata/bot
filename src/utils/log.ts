export function log(topic: string, ...obj: any[]) {
  console.log(`[${topic}]`, ...obj);
}
