# SimpleGame



Starting steps


npm  i
cd deploy/local/

pm2 start pm2.gateway.json

pm2 start pm2.lobby.json

# if the server is loaded success fully then 

# pm2 start pm2.client.json

# else pm2 reload 1

# pm2 reload 4



# Description

# routes folder contains http://localhost:5000/gateway/ API which manages load and selects appropriate lobby server for socket connection

# balance func manages load based on user connections

# You can add and subract servers in pm2.lobby.json based on the requirement gateway server will be notified when any such action takes place

# Redis data is used as a link between the servers,it also maintains current connections and helps in managing load

# dbconfig.js has all the db configuration data

# config.js can be used to get required config data

# dice roll can be rigged or a random roll

# client.js is used for testing events

# Player data is stored in memory and can be saved every five minutes or event based(game complete)

# If a sudden failure of server happen then safeExit() function can be used to store player data before losing in memory data.






