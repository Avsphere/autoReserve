# AutoReserve

## Setup

Reservation coordinator is service head

This has not really been tested so expect bugs

Make sure you have git and can make outside requests, curl something to check

You may need to
```
sudo apt-get install git curl -y
```

```
curl https://google.com
```

Navigate to your home directory

```
cd ~
```

Pull in the repository

```
git clone https://github.com/Avsphere/autoReserve.git
```

cd into autoReserve

```
cd ~/autoReserve
```

** Create a config.json from config.dummy.json and fill in the fields. For example**
```
cp config.dummy.json config.json
vim config.json
```

Make sure you can execute the setup script

```
chmod +x ./bin/setup.sh
```

Execute with sudo but as your user

```
sudo -u $USER ./bin/setup.sh
```


