This folder contains the files needed for a Docker container that will run
the Checkers server. The base container is Ubuntu Eoan Ermine.

# Files

* `Dockerfile`, which contains the instructions to modify the base Ubuntu
container with dependencies and copy files from this directory into the
container.

* `add_deps.sh`, which runs APT and npm to install dependencies. This is its
own script because this is a pretty long operation.

* `secure_installation.sql`, which runs a bunch of SQL commands to initialize
the MariaDB service.

* `system_setup.sh`, which runs the actual meat of the Docker build. It
installs dependencies and initializes the database with `add_deps.sh` and
`secure_installation.sql`.

* `run_checkers.sh`, which is the script the Docker container runs to
clone the Checkers repository, build from source, and run.

* `run_docker.sh`, which is a convenience script to run the Docker container.
This specifies a few options for running the container with minimal manual
effort.

* `docker_dbConfig.json`, which contains information for the Checkers server
to connect to the MariaDB service. Note that this does contain a password,
but it's solely local to the Docker container.

* `Makefile`, which contains a convenience option for building the Docker
container.
