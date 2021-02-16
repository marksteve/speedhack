import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react-hooks';
import localforage from 'localforage';
import * as api from '../api';

describe('api', () => {
  const apiHost = 'https://hacker-news.firebaseio.com/v0';

  const server = setupServer();
  beforeAll(() => server.listen());
  afterAll(() => {
    server.close();
    jest.restoreAllMocks();
  });

  describe('useStories()', () => {
    it('should first try to get cached stories', async () => {
      const getItem = jest
        .spyOn(localforage, 'getItem')
        .mockResolvedValue([5, 4, 3, 2, 1]);

      const { result, waitForNextUpdate } = renderHook(() =>
        api.useStories('newstories')
      );

      await waitForNextUpdate();
      expect(getItem).toHaveBeenCalledWith('newstories.json');
      const [ids] = result.current;
      expect(ids).toEqual([5, 4, 3, 2, 1]);
    });

    it('should try to fetch stories if cache is empty', async () => {
      jest.spyOn(localforage, 'getItem').mockResolvedValue(null);
      const setItem = jest
        .spyOn(localforage, 'setItem')
        .mockResolvedValue(null);
      server.resetHandlers(
        rest.get(`${apiHost}/newstories.json`, (req, res, ctx) => {
          return res(ctx.json([7, 6, 5, 4, 3]));
        })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        api.useStories('newstories')
      );

      await waitForNextUpdate();
      const [ids] = result.current;
      expect(ids).toEqual([7, 6, 5, 4, 3]);
      expect(setItem).toHaveBeenCalledWith('newstories.json', [7, 6, 5, 4, 3]);
    });

    it('should try to update stories after getting cached ones', async () => {
      jest.spyOn(localforage, 'getItem').mockResolvedValue([5, 4, 3, 2, 1]);
      const setItem = jest
        .spyOn(localforage, 'setItem')
        .mockResolvedValue(null);
      server.resetHandlers(
        rest.get(`${apiHost}/newstories.json`, (req, res, ctx) => {
          return res(ctx.json([7, 6, 5, 4, 3]));
        })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        api.useStories('newstories')
      );

      await waitForNextUpdate();
      const [cachedIds] = result.current;
      expect(cachedIds).toEqual([5, 4, 3, 2, 1]);

      await waitForNextUpdate();
      const [updatedIds] = result.current;
      expect(updatedIds).toEqual([7, 6, 5, 4, 3, 2, 1]);
      expect(setItem).toHaveBeenCalledWith('newstories.json', [
        7,
        6,
        5,
        4,
        3,
        2,
        1,
      ]);
    });
  });

  describe('item.read()', () => {
    const story = {
      by: 'dhouston',
      descendants: 71,
      id: 8863,
      kids: [],
      score: 111,
      time: 1175714200,
      title: 'My YC app: Dropbox - Throw away your USB drive',
      type: 'story',
      url: 'http://www.getdropbox.com/u/2/screencast.html',
    };

    afterEach(() => {
      // useAsset caches values in memory
      api.item.clear(story.id);
    });

    it('should first try to get cached item', async () => {
      const getItem = jest
        .spyOn(localforage, 'getItem')
        .mockResolvedValue(story);

      const { result, waitForNextUpdate } = renderHook(() =>
        api.item.read(story.id)
      );

      await waitForNextUpdate();
      expect(getItem).toHaveBeenCalledWith(`item/${story.id}.json`);
      expect(result.current).toEqual(story);
    });

    it('should try to fetch story if cache is empty', async () => {
      jest.spyOn(localforage, 'getItem').mockResolvedValue(null);
      const setItem = jest
        .spyOn(localforage, 'setItem')
        .mockResolvedValue(null);
      server.resetHandlers(
        rest.get(`${apiHost}/item/${story.id}.json`, (req, res, ctx) => {
          return res(ctx.json(story));
        })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        api.item.read(story.id)
      );

      await waitForNextUpdate();
      expect(result.current).toEqual(story);
      expect(setItem).toHaveBeenCalledWith(`item/${story.id}.json`, story);
    });
  });
});
