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
			this.inputField = inputfield;
			this.gravatar = gravatar;
			this.focused = false;
			// Look for hitting the enter key so we can send a message
			this.inputField.keypress({frame : this },
						this.keypress 
			);
			this.inputField.focus(function() {
				this.focused = true;
			} );
			this.inputField.blur(function() {
				this.focused = false;
			} );
			// adding an event handler
			this.chatlabel.click({'frame' : this },			
					this.toggleActive
			);
		},
			messageCounter : 0,
			chatFrames : [],
			maxChatFrames : 3,
			uid : Number(host.uid),
			queue : [],
			hoverBox: null,
		
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
		Friend : function(firstname,lastname, id, profileicon, label) {
			this.firstname = firstname;
			this.lastname = lastname;
			this.id = id;
			this.profileicon = profileicon;
			this.label = label;
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
		this.sidebar.append('<div class="friend" uid="' + friend.uid
				+'"><div class="friendpic">' +  friend.profilepic + 
				'</div><div class="friendname">' + friend.firstname + 
				' '+ friend.lastname + '</div><div class="onlinemark">'
				+ friend.onlinemark +'</div></div>');
		label = $('.friend[uid="'+friend.uid+ '"]');		
		friendObject = new PPPChat.Friend(friend.firstname, friend.lastname, friend.uid, friend.profileicon, label);
		label.click({'friend': friendObject },			
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
	 * Adds a chatframe to the UI
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
		reference.append('<div class="chatlabel" uid="'+ friend.uid +'">'+ friend.firstname+' '+friend.lastname +'</div>').append('<div class="outercontainer"><div class="history" uid="'+ friend.uid +'"></div></div>').append('<div class="inputfield" uid="'+ friend.uid +'"><textarea class="text"></textarea></div>');
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
		}
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
	PPPChat.message.prototype.addHover = function() {
		this.reference.children().hover(function(){
			console.log(this);
		});
	}
	
	
	/**
	 * Adding a message to a chatframe
	 * @param message
	 */
    PPPChat.chatFrame.prototype.addMessage = function(message) {
		string = '<div class="messagerow" clientid="'+message.clientid+'"><div class="';
		if (message.sender == PPPChat.uid) string += 'out';
		else string += 'in';
		string += '" clientid="'+ message.clientid+'">' + message.body + '</div></div>';
		this.chathistory.append(string);
		message.reference = this.chathistory.children('[clientid="'+message.clientid+'"]'); // create a reference to the message visual representation
		message.addHover();
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
		// every 5 seconds it will gather data to be sent, then send a request	 
		setTimeout(function(){
			request = controller.buildRequest()
			controller.sendRequest(request);
		}, 3000);
	}
	
	PPPChat.controller.prototype.sendRequest = function(request) {
			$.ajax({ 
				context : this,
				type : 'POST',
				url : request.url,
				data : { 
					action: 'refresh',
					lastMessageId : this.lastMessageId,
					messages : request.messages 
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
	 */
	PPPChat.controller.prototype.handleResponse = function(response) {
		if (response.ack != null) {
			response.ack.forEach(function(ack) {
				$('[clientid="'+ack.clientid+'"]').attr('serverid', ack.serverid);
				$('[clientid="'+ack.clientid+'"]').removeAttr('clientid', 1000 );
			});
		}
		if (response.messages != null) {
			response.messages.forEach(function(message){
				// find the corresponding frame
				this.updateLastMessageId(message.serverid);
				
				PPPChat.chatFrames.forEach(function(frame){
					// found the frame
					if (frame.uid == message.sender) {
						string = '<div class="messagerow" serverid="'+message.serverid+'"><img src="'+frame.gravatar+'"><div class="in" serverid="' + message.serverid +'">' + message.content + '</div></div>';
						// iterate through the message rows
						frame.chathistory.children('.messagerow').each(function() {
							// if the serverid of the given row is bigger, then insert it before the element
							// otherwise go on
							if ($(this).attr('serverid') > message.serverid) {
								$(this).before(string);
								return false; // exit the foreach
							}
								
						});
						frame.chathistory.append(string);
					}
					
				});
				// or open a new one
			}, this);
			this.chatsound.play(); // play the sound
		}
	};
	
	PPPChat.controller.prototype.updateLastMessageId = function(id) {
		if (this.lastMessageId < Number(id)) {
			this.lastMessageId = Number(id); 
		}
	}
	
	/**
	 * Gather messages and other information to be sent
	 */
	PPPChat.controller.prototype.buildRequest = function() {
		request = {};
		request.url = host.url;
		request.messages = [];
		request.lastmessage = this.lastMessageId;
		// we got messages to be sent
		PPPChat.queue.forEach(function(m) {
			message = { 
					'id' : m.id,
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
	 * Start our script
	 */
	var chat = new PPPChat.controller();
	chat.init();
});


