# Clone the git repository, and then build from source.
service mysql start
git clone https://github.com/PDX-Checkers/checkers.git
pushd checkers
    npm install
    npm run start-dev