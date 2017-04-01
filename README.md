# node-notif

### Installing and Setting Up

##### Mongo DB

You must have MongoDB installed, and your database should be a Replica Set.

##### Server

Rename ``` config.sample.js ``` to ``` config.js ```, and update your configuration there. 

```
npm install
npm start  

```
Server is live on localhost:8000

### What is happening ?

A subscriber subscribes via a POST request to the server. As and when any change in the database is recorded (via any means), the newly inserted/updated document is fetched by the service running at the backend, and is matched against any interested subscribers via the server. An email is sent to those subscribers notifying about the changes.

### Usage Example 

1) Make sure that your Replica Set is running, the configuration is updated, and the node server is live at port 8000 (see above).  

2) Subscribe yourself by sending a POST request to ``` http://localhost:8000/Subscribe ```, which should include your email, and set to ```true``` only those characters you want to subscribe.

```
{
	"client": "foo@bar.com"
	"Jenny": true,
	"Dan": true
}
```

3) On updateing the database with an entry insertion/upgradation, you'll get an email at the address which you POSTed in real-time!  

### Notes

1) Replica Set is a hard requirement ( and on hindsight, a fairly good practice too ) because Robe tails the [Oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) on a replica set only (to the best of my understanding). The Oplog tailing is the only way in MongoDB to keep a track of latest changes.

2) Robe is based on ES6 completely, so usage of ``` co``` library for generators was perfectly justified.

3) The express server itself doesn't use Robe as ODM, and instead uses the native Mongo Driver for very basic CRUD operations. This is because Robe was picked initially mainly to facilitate the Oplog Tailing easily, as I'm not aware of other drivers/ODMs which support it like Robe does.

4) Real-time notifications are currently being pushed out as Emails. 

5) To use Gmail you may need to configure ["Allow Less Secure Apps"](https://www.google.com/settings/security/lesssecureapps) in your Gmail account unless you are using 2FA in which case you would have to create an [Application Specific](https://security.google.com/settings/security/apppasswords) password. You also may need to unlock your account with ["Allow access to your Google account"](https://accounts.google.com/DisplayUnlockCaptcha) to use SMTP. 
