import { screen, render, waitFor } from '@testing-library/react';
import * as api from '../../api';
import Stories from '../Stories';

describe('Stories', () => {
  const stories = [1, 2, 3, 4, 5];

  it('should retrieve story ids from the api', async () => {
    const useStories = jest
      .spyOn(api, 'useStories')
      .mockReturnValue([stories, false, undefined]);
    render(<Stories endpoint="newstories" />);
    await waitFor(() => expect(useStories).toHaveBeenCalledWith('newstories'));
  });

  it('should render loading message while waiting for the api', async () => {
    jest.spyOn(api, 'useStories').mockReturnValue([[], true, undefined]);
    render(<Stories endpoint="newstories" />);
    await waitFor(() => screen.getByText('Fetching new stories…'));
  });

  it('should render error message if an error is encountered', async () => {
    jest.spyOn(api, 'useStories').mockReturnValue([[], false, new Error()]);
    render(<Stories endpoint="newstories" />);
    await waitFor(() => screen.getByText('Failed to fetch new stories'));
  });
});
