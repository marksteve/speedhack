import localforage from 'localforage';
import { createAsset } from 'use-asset';

export type Story = {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url: string;
};

type Item = Story;

const apiHost = 'https://hacker-news.firebaseio.com/v0';

async function cachedFetch(url: string) {
  let data: any = await localforage.getItem(url);

  if (data) {
    return data;
  }

  const res = await fetch(url);
  data = await res.json();

  if (data.error) {
    throw Error(data.error);
  }

  localforage.setItem(url, data);

  return data;
}

export const stories = createAsset<Story['id'][], [string, boolean?]>(
  async (endpoint) => {
    return await cachedFetch(`${apiHost}/${endpoint}.json`);
  }
);

export async function updateStories(
  endpoint: string,
  cached: Story['id'][],
  setLatestId: (latest: number) => void
) {
  const cachedSet = new Set<Story['id']>(cached);

  // Fetch story ids
  const url = `${apiHost}/${endpoint}.json`;
  const res = await fetch(url);
  const updatedSet = new Set<Story['id']>(await res.json());

  // Check for new items
  let newCount = 0;
  cachedSet.forEach((id) => {
    newCount += updatedSet.size === updatedSet.add(id).size ? 0 : 1;
  });

  // If there are new ones...
  if (newCount > 0) {
    // trim list to 500 items before storing in cache
    const ids = Array.from(updatedSet).slice(0, 500);
    localforage.setItem(url, ids);
    // and update latest id to trigger stories resource read
    stories.clear(endpoint);
    setLatestId(ids[0]);
  }
}

export const item = createAsset<Item, [number]>(async (id) => {
  return await cachedFetch(`${apiHost}/item/${id}.json`);
});
