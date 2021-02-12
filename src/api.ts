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

export const newStories = createAsset<Story['id'][], []>(async () => {
  const res = await fetch(`${apiHost}/newstories.json`);
  return await res.json();
});

export const item = createAsset<Item, [number]>(async (id) => {
  const res = await fetch(`${apiHost}/item/${id}.json`);
  return await res.json();
});
