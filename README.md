# node-notif

### Installing

##### Mongo DB

Preferably, kill all running instances of Mongod by : ``` sudo kill `ps -A | grep mongo | awk '{ print $1 }'` ```  

[Deploy a Replica Set](https://docs.mongodb.com/manual/tutorial/deploy-replica-set-for-testing/) first (using root privileges), and then import both the databases from ``` db ``` folder.

##### Server

```
npm install
npm start  

```
Server is live on localhost:8000

### Usage

Any HTTP client can subscribe to notifications by sending a POST request to ``` localhost:8000/subscribe ```. The information sent must have a client key or their socket address to where the notifications would be pushed.  

Currently, there is no special provision or interface to faciliate CRUD operations on the database, so those have to made manually using the Mongo Shell, or any other party interface which connects to the ```gossip-girl``` and ```subscribers``` databases.

### Notes

1) Replica Set is a hard requirement ( and on hindsight, a fairly good practice too ) because Robe tails the [Oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) on a replica set only (to the best of my understanding). The Oplog tailing is the only way in MongoDB to keep a track of latest changes.

2) Robe is based on ES6 completely, so usage of ``` co``` library for generators was perfectly justified.

3) The express server itself doesn't use Robe as ODM, and instead uses the native Mongo Driver for very basic CRUD operations. This is because Robe was picked initially mainly to facilitate the Oplog Tailing easily, as I'm not aware of other drivers/ODMs which support it like Robe does.

4) Real-time notifications are currently being pushed out as Socket Events, because the server cannot send to a client via HTTP without the client first requesting it. 