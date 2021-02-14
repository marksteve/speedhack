import localforage from 'localforage';
import { useEffect, useState } from 'react';
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
const maxStories = 1500;

export const item = createAsset<Item, [number]>(async (id) => {
  const url = `${apiHost}/item/${id}.json`;
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
});

export function useStories(endpoint: string) {
  const url = `${apiHost}/${endpoint}.json`;

  const [ids, setIds] = useState<Story['id'][]>([]);

  useEffect(() => {
    getCachedStories();

    async function getCachedStories() {
      const cached = await localforage.getItem<Story['id'][]>(url);
      if (cached) {
        setIds(cached);
        updateStories(cached);
      } else {
        fetchStories();
      }
    }

    async function fetchStories() {
      const res = await fetch(url);
      const fetched = await res.json();
      setIds(fetched);
      localforage.setItem(url, fetched);
    }

    async function updateStories(cached: Story['id'][]) {
      const cachedSet = new Set<Story['id']>(cached);

      const res = await fetch(url);
      const updatedSet = new Set<Story['id']>(await res.json());

      let newCount = 0;
      cachedSet.forEach((id) => {
        const exists = updatedSet.size === updatedSet.add(id).size;
        newCount += exists ? 0 : 1;
      });

      if (newCount > 0) {
        const updated = Array.from(updatedSet).slice(0, maxStories);
        setIds(updated);
        localforage.setItem(url, updated);
      }
    }
  }, [url, setIds]);

  return ids;
}
