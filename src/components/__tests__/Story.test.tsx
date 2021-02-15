// @ts-nocheck

import { act, render, waitFor } from '@testing-library/react';
import * as api from '../../api';
import { useVisible } from '../../stores';
import Story from '../Story';

describe('Story', () => {
  let observer;
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

  beforeEach(() => {
    observer = {
      observe: jest.fn(),
      unobserve: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an empty div when not yet visible', async () => {
    const result = render(<Story id={story.id} observer={observer} />);
    expect(result.container.firstChild.children).toHaveLength(0);
  });

  it('should render a placeholder after being marked visible while content is loading', async () => {
    const itemRead = jest.spyOn(api.item, 'read').mockImplementation(() => {
      // Simulate indefinite data loading
      throw new Promise(() => {});
    });
    const result = render(<Story id={story.id} observer={observer} />);
    act(() => {
      // Mark story as visible
      useVisible.setState({ [story.id]: true });
    });
    expect(itemRead).toHaveBeenCalledWith(story.id);
    await waitFor(() => result.getByTestId('story-placeholder'));
  });

  it('should render an error after being marked visible and content fails to load', async () => {
    // Mock console.error to suppress error boundary logs
    // https://github.com/facebook/react/issues/11098
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const itemRead = jest.spyOn(api.item, 'read').mockImplementation(() => {
      // Simulate an error
      throw new Error();
    });
    const result = render(<Story id={story.id} observer={observer} />);
    act(() => {
      // Mark story as visible
      useVisible.setState({ [story.id]: true });
    });
    expect(itemRead).toThrow();
    await waitFor(() => result.getByText('Failed to fetch story'));
  });

  it('should render the story after being marked visible and content succeeds to load', async () => {
    const itemRead = jest.spyOn(api.item, 'read').mockReturnValue(story);
    const result = render(<Story id={story.id} observer={observer} />);
    act(() => {
      // Mark story as visible
      useVisible.setState({ [story.id]: true });
    });
    expect(itemRead).toHaveBeenCalledWith(story.id);
    await waitFor(() => result.getByText(story.title));
    await waitFor(() => result.getByText(`by ${story.by}`));
    expect(result.getByTestId('story-time').getAttribute('datetime')).toEqual(
      new Date(story.time * 1000).toISOString()
    );
  });
});
