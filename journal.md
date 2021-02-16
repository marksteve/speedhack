## [[2021-02-16]]
- **8:30** Started
    - Finished writing component tests
    - API tests and infinite scroll test remaining!
- **9:15** Stopped
- **Session total: 45 mins**
- **20:45** Started
    - First time to learn about and try [React Hooks Testing Library](https://react-hooks-testing-library.com/) and [Mock Service Worker](https://mswjs.io/)! Glad to have done this exploration. These libraries can definitely help clean up some of the testing code from some of my current projects.
    - I'm at 12 hours already so I'm dropping infinite scrolling test with Cypress.
    - My partner made a design for my app! Going past the 12 hours limit to do this. I tell you it's worth it! https://www.figma.com/file/KLrJMiqcon4gVNNM7uKowY/Untitled
- **23:00**
- **Session total: 2 hours 15 mins**
- **Running total: 13 hours**

## [[2021-02-15]]
- **9:00** Started
    - Added icon and turned service worker on
- **9:15** Stopped. Adding tests later tonight and it should be ready for submission!
- **Session total: 15mins**
- **21:15** Started
    - Adding tests. Planning to do simple unit tests for components and the API and Cypress for infinite scroll testing.
    - Tried using Pollyjs for stubbing API calls but setup-polly-jest doesn't seem to work (getting failed adapter/persister registrations). Will mock things manually instead.
- **22:00** Stopped.
- **Session total: 45 mins**
- **Running total: 10 hours**

## [[2021-02-14]]
- **8:00** Started
    - Nothing beats good sleep. I was struggling last night in trying to make my caching mechanism work with suspense. I figured out that suspense wasn't really meant for what I was trying to do and got to improve my IntersectionObserver logic over the first 15 mins of working this morning. I haven't even had coffee yet!
- **9:00** Stopping for late breakfast. Happy with how it's coming along! Just needs some error handling and tests w/c should fit in the remaining time.
- **Session total: 1 hour**
- **13:45** Started
    - Worked on error handling. Added nicer error messages.
- **14:30** Stopped
- **Session total: 45 mins**
- **21:30** Started
    - Project name: Speedhack
    - Will setup automated deployment first before setting up tests
- **22:30** Stopped
- **Session total: 1 hour**
- **Running total: 9 hours**

## [[2021-02-13]]
- **19:30** Started
    - Added story meta and placeholder. There's a bunch of placeholder libraries out there but seemed overkill for the 2 boxes I wanted so I just wrote my own small svg component.
    - Generalized stories component in case I have time to add other endpoints for stories: top, best, ask, show, and job
    - Starting work on offline support. Plan is to try and retrieve from cache first. Also to try to fetch remotely and update inline if there are new entries. If fetch fails, show a notif that you're offline.
    - Funny observation: new stories show up faster from the API than the actual HN site. Probably because of caching. 
- **23:00** Stopped. 
- **Session total: 3 hours 30 mins**
- **Running total: 6 hours 15 mins**

## [[2021-02-12]]
- **8:30** Holiday! I'm going out to climb in a new gym but I have some time in the morning to work on the project.
    - I want to use Suspense to make it easier to incrementally fetch things
        - Been aware of https://github.com/pmndrs/use-asset for a while and have always wanted to try it!
        - The first example in it's docs queries the HN API heh
    - Fetching new stories done! Now I need to load an initial number of stories.
    - My plan is to render story placeholders for all stories and load their details as they become visible in the viewport. It's a bit different from the traditional infinite scrolling behavior that appends content as they become available. I know there are some libraries that help listen to when elements show up in view and the new ones use the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) browser API. I haven't tried that native API myself so instead of using a library, I'll try work with it directly.
    - IntersectionObserver is now working nicely but I'm still trying to figure out how to fetch things efficiently
- **10:30** Stopped for lunch prep
- **Session total: 2 hours**
- **11:30** Started again while waiting for food to cook
    - I stored visibility state as a map of story ids and booleans. The boolean flips true when the story intersects the viewport. I used my go-to state management library [zustand](https://github.com/pmndrs/zustand#selecting-multiple-state-slices) for this so I could do fast reads with a selector.
- **12:00** Stopped for lunch. We head out to climb after lunch.
- **Session total: 30 mins**
- **Running total: 2 hours 45 mins**

## [[2021-02-11]]
- **22:00** Started
    - Changed my mind about TS
    - Bootstrapped project with `cra-template-pwa-typescript`
- **22:15** Stopped: Catchup call with friend
- **Session total: 15 mins**

## [[2021-02-10]]
- Set Feb 17 as deadline
- Thought about writing it in TS but seems unnecessary for the expected data models
- HN API Review
    - https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty
        - Latest 500 story ids
    - https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty
        - Max item ID could be useful for showing new story notif
    - https://hacker-news.firebaseio.com/v0/item/:id
        - Retrieve story details
- Offline mode
    - React PWA support
    - localForage for caching API responses
