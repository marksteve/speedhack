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

async function apiFetch(url: string) {
  const res = await fetch(`${apiHost}/${url}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }
  return data;
}

export const item = createAsset<Item, [number]>(async (id) => {
  const url = `item/${id}.json`;

  let data: any = await localforage.getItem(url);

  if (data) {
    return data;
  }

  data = await apiFetch(url);
  localforage.setItem(url, data);
  return data;
});

export function useStories(endpoint: string) {
  const url = `${endpoint}.json`;

  const [ids, setIds] = useState<Story['id'][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setIsLoading(true);
    getCachedStories();

    async function getCachedStories() {
      const cached = await localforage.getItem<Story['id'][]>(url);
      if (cached) {
        setIds(cached);
        setIsLoading(false);
        updateStories(cached);
      } else {
        fetchStories();
      }
    }

    async function fetchStories() {
      try {
        const fetched = await apiFetch(url);
        setIds(fetched);
        localforage.setItem(url, fetched);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    async function updateStories(cached: Story['id'][]) {
      const cachedSet = new Set<Story['id']>(cached);

      try {
        const fetched = await apiFetch(url);
        const updatedSet = new Set<Story['id']>(fetched);

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
      } catch (err) {
        // TODO: Show notif that user is in offline-mode
        console.warn(err);
      }
    }
  }, [url, setIds]);

  return [ids, isLoading, error] as const;
}
