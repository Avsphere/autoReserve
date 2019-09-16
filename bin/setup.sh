#!/bin/bash
echo "Starting setup"


sudo apt-get update -y
sudo apt-get upgrade -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

source ~/.bashrc

nvm install --lts

npm install

npm install -g pm2

pm2 start -n autoReserve reservationCoordinator.js

pm2 list

echo "All done. use pm2 logs to make see output"