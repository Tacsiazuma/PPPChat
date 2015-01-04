// now we can use dollar function
jQuery(document).ready(function($) {
	// create the namespace
	var PPPChat = {
		/**
		 * A chatframe object
		 * @param frameid the given frame id
		 * @param uid of the friend
		 * @param name of the friend
		 * @param reference to the chatframe root
		 * @param chatlabel reference to the label of the chatframe
		 * @param history reference to the chathistory
		 * @param inputField reference to the textarea
		 * @param gravatar of the friend
		 */
		chatFrame : function(frameid, uid, name, reference, chatlabel, history, inputfield, gravatar){
			this.frameid = frameid;
			this.active = false;
			this.uid = uid;
			this.name = name;
			this.messages = [];
			this.reference = reference;
			this.chatlabel = chatlabel;
			this.chathistory = history;
			this.hasUnread = false;
			this.inputField = inputfield;
			this.gravatar = gravatar;
			this.focused = false;
			// Look for hitting the enter key so we can send a message
			this.inputField.keypress({frame : this },
						this.keypress 
			);
			this.inputField.focus(function() {
				this.focused = true;
				this.hasUnread = false; // we focused on the chatframe so turn off the unread message alert
			} );
			this.inputField.blur(function() {
				this.focused = false;
			} );
			// adding event handlers
			this.chatlabel.click({'frame' : this },			
					this.toggleActive
			);
			// and the last step, request a chatframe fill
			PPPChat.fillRequest.push(this.uid);
		},
			messageCounter : 0,
			chatFrames : [],
			maxChatFrames : 3,
			uid : Number(host.uid),
			queue : [],
			hoverBox: null,
			fillRequest: [],
		/**
		 * Our controller class
		 */
		controller : function() {
			this.url = host.url;
			this.lastMessageId = 0;
			// constructor
			this.siteTitle = document.title;
			this.chatsound = new Audio("https://fbstatic-a.akamaihd.net/rsrc.php/yT/r/q-Drar4Ade6.ogg"); 
			this.messagecounter = 0;
			this.friendList = [];
			this.delivered = [],
			this.friends = host.friend;
		},
			/**
			 * The message object
			 */
		message : function(sender, receiver, body, clientid, sent, read){
			this.sender = sender,
			this.receiver = receiver,
			this.body = body,
			this.sent = sent,
			this.read = read,
			this.clientid = clientid,
			this.serverid = null;
			this.reference = null;
		},
			
		/**
		 *  The friend object
		 */
		Friend : function(firstname,lastname, id, gravatar, label) {
			this.firstname = firstname;
			this.lastname = lastname;
			this.id = id;
			this.gravatar = gravatar;
			this.label = label;
			this.chatframe = null;
			// toggle hover class on mousemove
			this.label.bind('mousemove',{ label : this.label }, function(event){
				event.data.label.addClass('hover');
			})
			// toggle hover class on leaving
			this.label.bind('mouseout',{ 'label' : this.label }, function(event){
				event.data.label.removeClass('hover');
			})
		},

	}
	/**
	 * Set chatFrame focused property
	 * @param event
	 */
	PPPChat.chatFrame.prototype.focused = function(event) {
		frame = event.data.frame;
		frame.focused = event.data.focused;
	}
	
	
	/**
	 * Function for adding a friend to the friendlist 
	 * @param friend
	 */
	PPPChat.controller.prototype.addFriend = function(friend) {
		console.log('lefut');
		this.sidebar.append('<div class="friend" uid="' + Number(friend.uid)
				+'"><div class="friendpic">' +  friend.profilepic + 
				'</div><div class="friendname">' + friend.firstname + 
				' '+ friend.lastname + '</div><div class="onlinemark">'
				+ friend.onlinemark +'</div></div>');
		label = $('.friend[uid="'+Number(friend.uid)+ '"]');		
		// create the friend object
		friendObject = new PPPChat.Friend(friend.firstname, friend.lastname, friend.uid, friend.profilepic, label);
	
		// open a chatframe on click
		label.click({
			'friend': friendObject },			
			this.addChatFrame
		);
		
		this.friendList.push(friendObject);
	}
	
	PPPChat.chatFrame.prototype.toggleActive = function(event) {
		frame = event.data.frame;
		if (frame.active == true) { 
			frame.reference.removeClass('active');
			frame.reference.children().removeClass('active');
			frame.active = false;
		}
		else {
			frame.active = true;
			frame.reference.addClass('active');
			frame.reference.children().addClass('active');
		}
			
	}
	/**
	 * We successfully sent a message to get rid of its pending attribute
	 */
	PPPChat.message.prototype.successfullySent = function(serverid) {
		this.serverid = Number(serverid);
		this.reference.children().removeClass('pending');
		this.reference.attr('serverid', serverid);
		this.sent = timeConverter() ;
	}
	/**
	 * sort the chathistory depending on serverid
	 */
	PPPChat.chatFrame.prototype.sortContent = function() {
		console.log(this.chathistory.children().sort(sortMessageRows));
	}
	
	function sortMessageRows(a, b) {
		console.log(a);
		if (a.attr('serverid') < b.attr('serverid')) {
			return -1;
		} else {
			return 1;
		}
	}
	
	/**
	 * Adds a chatframe to the UI by the given friend object
	 * Initially fills the chathistory object with a preloader and requests
	 * messages via ajax to fill it. 
	 * @param event
	 */
	
	PPPChat.controller.prototype.addChatFrame = function(event) {
		friend = event.data.friend;
		// check if we got the maximum number of chatframes
		if (PPPChat.chatFrames.length < PPPChat.maxChatFrames) {
			// if we aint got, then check if we got the chatframe for this uid
			for (x = 0; x < PPPChat.chatFrames.length; x++) {
				frame = PPPChat.chatFrames[x];
				// if we got it then make this frame active then return from this function
				if (Number(frame.uid) == Number(friend.id)) {
					frame.makeActive();
					return false;
				}
			}
		frameid = 	PPPChat.chatFrames.length;
		$('#chatframewrapper').append('<div id="pppchat" frame="'+frameid+'"></div>');
		reference = $('[frame="'+frameid + '"]');
		reference.append('<div class="chatlabel">'+ friend.firstname+' '+friend.lastname +'<div>X</div></div>').append('<div class="outercontainer"><div class="history"></div></div>').append('<div class="inputfield"><textarea class="text"></textarea></div>');
		chatLabel = reference.children('.chatlabel');
		chatHistory = chatLabel.next().children('.history');
		inputField = reference.children('.inputfield').children();
		
		frame = new PPPChat.chatFrame(frameid, // the given frame id
				friend.id, // uid of the friend
				friend.firstname+ ' '+ friend.lastname, //name of the friend
				reference, // reference to the frame root
				chatLabel, // reference to the chatlabel
				chatHistory, // reference to the chathistory
				inputField, // reference to the textarea
				friend.gravatar); // gravatar of the friend
		PPPChat.chatFrames.push(frame); // add it the chatframes
		friend.chatframe = frame;
		}
	}
	/**
	 * The flashing document title regarding to an unread message
	 */
	PPPChat.controller.prototype.hasUnread = function() {
		
	}
	
	
	/**
	 * Initialize the plugin
	 * Create the sidebar, then fill it with friends got by json headscript
	 * Then create the chatframewrapper and start the background process
	 */
	PPPChat.controller.prototype.init = function() {
		// build up the sidebar
		$('body').append('<div id="chatsidebar"></div>');
		this.sidebar = $('#chatsidebar');
		$('body').append('<div id="pppchathover"></div>');
		PPPChat.hoverBox = $('#pppchathover');
		if (host.friend != null) {
        this.friends.forEach(function(friend){
        	this.addFriend(friend);
        	}, this);
		}
  
        $('body').append("<div id=\"chatframewrapper\"></div>");
		this.wrapper = $('#chatframewrapper');
		PPPChat.controller.background(this); // we start the background process
	}
	
	/**
	 * Add a hover event handler to a message
	 */
	PPPChat.message.prototype.addHover = function(message) {


		this.reference.children().mousemove(function(e){
			PPPChat.hoverBox.css('display', 'block').css('top', e.clientY +5).css('left', e.clientX+5).text(message);
		});
		this.reference.children().mouseout(function(){
			PPPChat.hoverBox.css('display', 'none');
		});
	}
	
	
	/**
	 * Adding a message to a chatframe
	 * @param message
	 */
    PPPChat.chatFrame.prototype.addMessage = function(message) {
    	// lets check that we got the message with the serverid first
    	this.messages.forEach(function(m) {
    		// if we got it then delete the original one from the list and from the UI
    		if (m.serverid == message.serverid) {
    			m.reference.remove();
    		} 
    	}, this)
		string = '<div class="messagerow" clientid="'+ message.clientid +'">';
		if (message.sender == this.uid) {
			string += this.gravatar;
		}
		string += '<div class="';
		if (message.sender == PPPChat.uid) 
			string += 'out';
		else 
			string += 'in';
		if (message.serverid == null )
			string += ' pending';
		string += '" clientid="'+ message.clientid+'">' + message.body + '</div></div>';
		this.chathistory.append(string);
		message.reference = this.chathistory.children('[clientid="'+message.clientid+'"]').last(); // create a reference to the message visual representation
		message.addHover(message.sent);
		this.messages.push(message);
		this.chathistory.parent().scrollTop(frame.chathistory.height());
		this.inputField.val('');
	}
    /**
     * Make a chatframe active
     */
	PPPChat.chatFrame.prototype.makeActive = function() {
		this.reference.addClass('active');
		this.reference.children().addClass('active');
	}
	/**
	 * Event handler for the chatframe inputfield
	 * 
	 * @param event
	 */
	PPPChat.chatFrame.prototype.keypress = function(event) {
		if (event.which == 13) {
			event.data.frame.addToQueue();
		}
	}
	/**
	 * We hit an enter in the inpufield so we check if its whitespace and if not we are adding it to the frame history
	 * and the message queue to be sent via ajax
	 */
	PPPChat.chatFrame.prototype.addToQueue = function(){
		if (this.inputField.val().trim() == '') return;
		// generate a message object
		message = new PPPChat.message(PPPChat.uid,	// sender uid
				  Number(this.uid), // target uid
				  this.inputField.val(), // the message to be sent
				  PPPChat.messageCounter,	// the client id
				  new Date().getTime()); // and the timestamp
		// clear the textarea
		this.inputField.val('');
		PPPChat.messageCounter++; // we increment the counter to keep track of messages client side to keep track of their arrival
		this.addMessage(message); // we add the message to the chatframe history and add a property to its visual representation for further access
		PPPChat.queue.push(message);  // push the message to the queue so it will be sended at the next cycle
	}
	/**
	 * Adds a new chatframe to the UI limited by the maxChatFrames variable
	 */
	
	/**
	 * Toggles a chatframe on/off
	 */
	PPPChat.chatFrame.prototype.toggle = function() {
		// megkeressük a hozzá tartozó frame-et
		PPPChat.chatFrames.forEach(function(chatFrame) {
			if (chatFrame.frameid == frameid) {
				chatFrame.reference.toggleClass('active')
				chatFrame.reference.children().toggleClass('active');
			}
		});
	}
	/**
	 * The background process
	 */
	PPPChat.controller.background = function(controller) {
		// every 2 seconds it will gather data to be sent, then send a request	 
		setTimeout(function(){
			request = controller.buildRequest()
			controller.sendRequest(request);
		}, 2000);
		
	}
	
	PPPChat.controller.prototype.sendRequest = function(request) {
			$.ajax({ 
				context : this,
				type : 'POST',
				url : request.url,
				data : { 
					fill : request.fill,
					delivered : request.delivered, // we send back the id's of the messages we got to update
					action: 'refresh', // DO NOT change it as wp needs this field
					messages : request.messages  // we assign the messages we sent
				},			
				success: function(response) {
					this.handleResponse(response)
				},
				complete: function() { 
					PPPChat.controller.background(this) },
				dataType: 'json' }
			)
	}
	
	/**
	 * Handles the response from the server
	 * @param response
	 */
	
	PPPChat.controller.prototype.handleResponse = function(response) {
		// if present, foreach the acknowledgements
		if (response.ack != null) {
			response.ack.forEach(function(ack) {
				// look inside the chatFrames
				PPPChat.chatFrames.forEach(function(frame) {
					frame.messages.forEach(function(message){
						if (Number(ack.clientid) == Number(message.clientid)) {
							message.successfullySent(ack.serverid);
						}
						
					})
					
				});
			});
		}
		// if messages present
		if (response.messages != null) {
			// foreach them
			response.messages.forEach(function(m){
				message = new PPPChat.message( // create message objects from them
						Number(m.sender),
						Number(m.receiver),
						m.content,
						m.clientid,
						m.sent,
						new Date().getTime()
						);
				message.serverid = m.serverid;
				// update the last message id
				this.delivered.push(m.serverid); // add it to the delivered messages
				// find the corresponding friend in the list
				this.friendList.forEach(function(friend){
					// look if we got an open frame for it
					if (friend.id == message.sender || friend.id == message.receiver) {
						if (friend.frame == null) {
							event = { data: {'friend': friend }};
							this.addChatFrame(event);
						}
						    friend.chatframe.addMessage(message); // add the message
							friend.chatframe.makeActive(); // make that chatframe active
					}
				},this);
			}, this);
			
		}
	}
		
	PPPChat.controller.prototype.updateLastMessageId = function(id) {
		if (Number(this.lastMessageId) < Number(id)) {
			this.lastMessageId = Number(id); 
		}
	}
	
	/**
	 * Gather messages and other information to be sent
	 */
	PPPChat.controller.prototype.buildRequest = function() {
		request = {}; // make the request object
		request.delivered = this.delivered; // assign the read message id's
		this.delivered = []; // empty the array
		request.url = host.url;
		request.fill = PPPChat.fillRequest; // assign the fill requests
		PPPChat.fillRequest = []; // empty the array
		request.messages = [];
		request.lastmessage = this.lastMessageId;
		// we got messages to be sent
		PPPChat.queue.forEach(function(m) {
			message = { 
					'body': m.body,
					'sender': m.sender,
					'clientid': m.clientid,
					'sent': m.sent,
					'receiver': m.receiver
					};
			request.messages.push(message);
		});  // assign the message objects to be sent
			PPPChat.queue = []; // empty the message queue
		return request;
	}
	
	/**
	 * Some helper function
	 */
	function timeConverter(UNIX_timestamp){
		  var a = new Date(UNIX_timestamp);
		  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		  var year = a.getFullYear();
		  var month = months[a.getMonth()];
		  var date = a.getDate();
		  var hour = a.getHours();
		  var min = a.getMinutes();
		  if (min < 10) min = '0' + min;
		  var sec = a.getSeconds();
		  var time = date + ', ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
		  return time;
		}	
	
	/**
	 * Start our script
	 */
	var chat = new PPPChat.controller();
	chat.init();

	
});


