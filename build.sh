# Build backend
rm -rf ./build/ 
tsc

# Build frontend
mkdir ./build/public/
cd ./src/public/checkers-client
npm run build
mv build checkers-client
mv checkers-client ../../../build/public
