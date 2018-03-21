const socket = io();

function scrollToBottom () {
    // Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child')
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
  
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
      messages.scrollTop(scrollHeight);
    }
  }

socket.on('connect', function() {
    const params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function(err){
        if(err){
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    });
});

socket.on('disconnect', function() {
    console.log('disconnected from server');
});

socket.on('updateUserList', function(users) {
    let ol = jQuery('<ol></ol>');
    users.forEach(function(user){
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('newMessage', function(message){
    const formattedTime = moment(message.createdAt).format('h:mm a');
    const template = jQuery('#message-template').html();
    const html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
    // let li = jQuery('<li></li>');
    // li.text(`${message.from} (${formattedTime}): ${message.text}`);

    // jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message){
    const formattedTime = moment(message.createdAt).format('h:mm a');
    const template = jQuery('#location-message-template').html();
    const html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });

    // let li = jQuery('<li></li>');
    // let a = jQuery('<a target="_blank">My current location</a>');
    // li.text(`${message.from} (${formattedTime}): `);
    // a.attr('href', message.url);

    // li.append(a);
    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function(event) {
    event.preventDefault();

    const messageTextbox = jQuery('[name=message]');

    socket.emit('createMessage', {
        text: messageTextbox.val()
    }, function() {
        messageTextbox.val('');
    });
});

const locationButton = jQuery('#send-location');
locationButton.on('click', function() {
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttr('disabled').text('Send location');
        console.log(position);
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

    }, function() {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location');
    });
});