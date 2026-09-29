# Movie Explorer

A React app for searching movies, seeing what's trending and keeping a list of favourites. Data comes from the [TMDb API](https://developer.themoviedb.org/docs).

- Live demo: _add the Vercel / Netlify URL here_
- Demo login: `demo` / `movies123`

## Running it locally

You'll need Node 18+ and a free TMDb API key.

1. Get a key: sign up at themoviedb.org, then go to Settings → API. Either the "API Read Access Token" or the v3 "API Key" works; the token is preferred.

2. Install and add the key:

   ```bash
   git clone <repo-url> movie-explorer
   cd movie-explorer
   npm install
   cp .env.example .env    # Windows: copy .env.example .env
   ```

   In `.env`, set one of these:

   ```env
   REACT_APP_TMDB_READ_TOKEN=your-token   # sent as "Authorization: Bearer ..."
   REACT_APP_TMDB_API_KEY=your-v3-key     # used only if the token isn't set
   ```

3. Start it:

   ```bash
   npm start
   ```

   It opens on http://localhost:3000. Without a key the app still loads, but it shows a message telling you the key is missing.

Other scripts:

```bash
npm run build     # production build in /build
npm run test:ci   # run the tests once
npm run lint      # ESLint, fails on any warning
npm run format    # Prettier
```

## Features

What the brief asked for:

- **Login:** username and password with validation. Every other page redirects to `/login` until you sign in, then sends you back to the page you wanted.
- **Search:** waits until you stop typing for 500 ms before searching; Enter searches straight away. The last search is saved in localStorage and restored on reload.
- **Poster grid:** each card shows the title, release year and rating. The grid is 2 columns on phones and up to 6 on large screens.
- **Movie details:** overview, genres, runtime, rating, director, top cast and the trailer.
- **Trending:** a Trending row on the home page with a Today / This week switch. It stays visible while you search. "See all" opens a `/trending` page with the #1 movie featured at the top and a ranked grid below it.
- **Light / dark mode:** follows the system setting on first visit, then remembers your choice.
- **Favourites:** saved in localStorage, separately for each user, with their own page.
- **Infinite scroll:** available on the results grid, plus friendly error messages with a Retry button whenever TMDb fails.

Bonus items:

- **Filters:** genre, year and minimum rating.
- **YouTube trailers:** play on the details page. The player only loads when you press play (see the notes below).
- **"Load more" button:** you can switch between it and infinite scroll, and the app remembers your choice.

Other things I added along the way:

- **Phone navigation:** on phones the main links move to a bottom navigation bar, and buttons have larger tap areas on touch screens.
- **Back button:** returns you to the same scroll position with everything you'd loaded still there.
- **Loading placeholders** so the layout doesn't jump when content arrives.
- **Pages load on demand:** details, favourites and trending are code-split.
- **Error boundary:** a crash shows a recovery screen instead of a blank page.

## How it's built

React 18 (Create React App), MUI v6, React Router v6, axios, and the Context API for state.

```
src/
  api/          tmdbClient.js (axios instance) and movieService.js (one function per endpoint)
  context/      Auth, ThemeMode, Favorites, Movies (+ movieReducer.js)
  hooks/        useDebounce, useLocalStorage, useInfiniteScroll, useHorizontalScroll, useTrendingMovies, ...
  components/   layout/, movies/ (MovieCard, MovieGrid, TrendingRow, TrailerPlayer, ...), common/, auth/
  pages/        Login, Home, Trending, MovieDetails, Favorites, NotFound
  utils/        formatters, error mapping, safe localStorage helpers
  theme.js      colours, typography and component overrides for MUI
```

Data flows one way: pages and components → context → `movieService` → `tmdbClient`. Components never call axios themselves, so all the TMDb-specific code lives in `src/api`.

**State.** There are four contexts:

- `AuthContext`: the logged-in user.
- `ThemeModeContext`: light / dark mode.
- `FavoritesContext`: the favourites list.
- `MoviesContext`: search, filters and the results grid. It uses `useReducer` with a plain reducer in `movieReducer.js`, which is unit tested on its own. I looked at Redux, but for an app this size, Context plus a reducer gives the same predictable updates without the extra setup.

**Routes:** `/`, `/trending`, `/movie/:movieId`, `/favorites`, `/login`, and a 404 page. `ScrollRestoration` handles scroll position on Back. The trending time window is kept in the URL (`/trending?window=day`), so the link can be shared.

## API usage

All requests go to `https://api.themoviedb.org/3`:

| Used for | Endpoint |
| --- | --- |
| Trending row and page | `GET /trending/movie/{day,week}` |
| Default grid | `GET /movie/popular` |
| Search | `GET /search/movie?query=...&primary_release_year=...` |
| Filters without a search | `GET /discover/movie?with_genres=...&primary_release_year=...&vote_average.gte=...` |
| Details page | `GET /movie/{id}?append_to_response=credits,videos` |
| Genre list | `GET /genre/movie/list` |

A few notes:

- The details page uses `append_to_response`, so details, cast and videos come back in one request instead of three.
- Genres, movie details and trending results are cached in memory for the session.
- The rating filter also sends `vote_count.gte=50`. Without it, titles with a single 10/10 vote fill the results.
- Images come from `image.tmdb.org`, sized for where they're shown: `w342` for cards, `w1280` for backdrops.

**Error handling.** axios errors are converted in one interceptor in `tmdbClient.js` into readable messages:

- 401: bad key.
- 404: not found.
- 429: rate limited.
- 5xx: TMDb is down.
- No response: offline or timed out.

When a request is superseded (for example by a newer search), it is cancelled with `AbortController` and ignored. If loading the next page fails, the movies already on screen stay put and a Retry button appears under them.

## Decisions and known limitations

- **The login is simulated.** There's no backend in the brief, so credentials are checked against a demo account in the browser, and only the username is saved. `login()` is async, so swapping in a real API would only touch `AuthContext`.
- **The API key ships in the bundle.** That's unavoidable in a front-end-only app. TMDb read keys only expose public data, but in production I'd put a small serverless proxy in front of TMDb.
- **Search with genre or rating filters.** TMDb's search endpoint can't filter by genre or rating, so while you're searching those two filters are applied in the browser. If a page ends up empty after filtering, the app fetches up to 5 more pages. Without a search, the discover endpoint handles all the filters.
- **Trending state lives outside the context.** The trending row and page keep their state in `useTrendingMovies` rather than in `MoviesContext`. It works, but moving it into the context would be cleaner.
- **Trailers load only on click.** A normal YouTube embed downloads about 1 MB of YouTube's scripts before anyone presses play. The details page shows the backdrop with a play button instead, and only creates the YouTube iframe when you click it. There's a "Watch on YouTube" link underneath for trailers that can't be embedded.
- **Brand colour.** The red is slightly different in light and dark mode, so that red text passes WCAG AA contrast in both. The values are in `theme.js`.
- **Create React App setup.** The brief asked for CRA. The `create-react-app` command failed on my machine because of an npm cache problem, so I set up the same `react-scripts` 5 project by hand. For a new project today I'd use Vite, since CRA is no longer maintained.

## Tests

```bash
npm run test:ci
```

There are 32 tests (Jest and React Testing Library), covering:

- The reducer.
- The formatting and error-mapping helpers.
- The search box: typing delay, Enter and clear.
- Movie cards and favourites.
- The login form.
- Parsing the trending URL.

I checked the full flows (login, search, pagination, details, trailer, favourites, dark mode, errors, and layouts from 320 px to 1920 px wide) by hand in the browser. There are no end-to-end tests in the repo yet; adding Playwright tests to CI is the next thing I'd do.

## Deployment

It's a single-page app, so every URL has to be served `index.html`. `vercel.json` and `public/_redirects` handle that on Vercel and Netlify.

1. Import the repo into Vercel or Netlify. Both detect Create React App: build with `npm run build` and publish the `build` folder.
2. Add `REACT_APP_TMDB_READ_TOKEN` as an environment variable in the host's settings.
3. Deploy. CRA bakes environment variables in at build time, so redeploy whenever you change them.

## What I'd do next

- Move trending into context.
- Add Playwright end-to-end tests to CI.
- Put the search text and filters in the URL, so searches can be shared and bookmarked.
- Add a "More like this" section on the details page.
- Add a small serverless proxy for the TMDb key.

---

Designed and developed by Ashan Lokuge. Movie data and images from [TMDb](https://www.themoviedb.org/). This product uses the TMDb API but is not endorsed or certified by TMDb.
