FROM ubuntu:eoan

COPY install_deps.sh /install_deps.sh
RUN bash install_deps.sh
# system_setup.sh installs dependencies and initializes the database by running
# secure_installation.sql
COPY system_setup.sh /system_setup.sh
COPY secure_installation.sql /secure_installation.sql
RUN bash system_setup.sh

# Files needed to run the server. run_checkers starts MariaDB, clones the
# checkers repository, builds the project from source, and starts it.
# dbConfig.json contains the data that the server will use to connect to
# MariaDB.
COPY run_checkers.sh /run_checkers.sh
COPY docker_dbConfig.json /root/.config/dbConfig.json

# Command that is run when we actually run the Docker container.
CMD bash run_checkers.sh