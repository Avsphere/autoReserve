#!/bin/bash
echo "Beginning setup"

sudo apt-get update -y
sudo apt-get upgrade -y

sudo apt-get install git -y

curl - o - https: //raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install --lts

git clone https://github.com/Avsphere/autoReserve.git

cd ~/autoReserve

npm install

npm install -g pm2

pm2 start -n autoReserve reservationCoordinator.js




