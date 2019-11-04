npm is silly, but its effective for getting something started quickly.

General flow when you pull down the repo:
0. Install `npm` via your preferred method. Its a node package manager/build manager/script runner.
1. Do `npm install` to install all relevant local packages (these are pulled from the dependencies in package.json)
2. Build and run the code in your dev environment by running `npm run start-dev`. The server will now be running on localhost:3000. 
The only endpoint is a GET on localhost:3000/api/game.
3. To debug, do `npm run build`, which will transpile all ts files to js files and puts those js files in the `build` folder. 
Then, you can do `npm run debug` to start debugging in start.ts, where the server starts up
4. Hopefully profit.